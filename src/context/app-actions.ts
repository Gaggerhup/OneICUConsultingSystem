import type { Dispatch, SetStateAction } from 'react';
import type { ActivityLogItem, Case, Notification, SpecialistMember, Toast, UserProfile } from '@/context/AppContext';
import { createTranslator, type Language } from '@/i18n/messages';
import { authService } from '@/services/auth';
import { mergeLockedProviderIdentity, normalizeHospitalName } from '@/lib/provider-profile';
import { safeWrite, STORAGE_KEYS } from '@/lib/app-state';
import { sendNotification } from '@/actions/sendNotification';
import { createCase, updateCaseDetail } from '@/actions/cases';

type AppActionDeps = {
  requests: Case[];
  activeCases: Case[];
  archiveCases: Case[];
  activities: ActivityLogItem[];
  setRequests: Dispatch<SetStateAction<Case[]>>;
  setActiveCases: Dispatch<SetStateAction<Case[]>>;
  setArchiveCases: Dispatch<SetStateAction<Case[]>>;
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  setActivities: Dispatch<SetStateAction<ActivityLogItem[]>>;
  setUserProfile: Dispatch<SetStateAction<UserProfile>>;
  showToast: (message: string, type?: Toast['type']) => void;
  addActivity: (title: string, desc: string, icon: ActivityLogItem['icon'], details?: string | null) => void;
};

const createNow = () => new Date().toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const createItemId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const getLanguage = (): Language => {
  if (typeof window === 'undefined') return 'th';
  const stored = window.localStorage.getItem('app_language');
  return stored === 'en' ? 'en' : 'th';
};

const getTranslator = () => createTranslator(getLanguage());

const createJustNow = () => (getLanguage() === 'th' ? 'เมื่อสักครู่' : 'Just now');

export function createAppActions(deps: AppActionDeps) {
  const approveRequest = async (id: string) => {
    const found = deps.requests.find((item) => item.id === id);
    if (!found) return false;
    const t = getTranslator();

    const approvedCase: Case = {
      ...found,
      status: 'Active',
      lastAction: 'Approved',
      lastActiveTime: createNow(),
    };

    // Persist status change to database
    try {
      await updateCaseDetail(id, { status: 'Active', lastAction: 'Approved', lastActiveTime: createNow() });
    } catch (err) {
      console.error('[approveRequest] DB update failed:', err);
    }

    deps.setRequests((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    deps.setActiveCases((prev) => {
      const next = [approvedCase, ...prev];
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    deps.setNotifications((prev) => {
      const next: Notification[] = [{ id: createItemId('notif'), title: t('common.approve'), message: `${found.patientName} ${getLanguage() === 'th' ? 'ได้รับการอนุมัติแล้ว' : 'was approved.'}`, time: createJustNow(), read: false, type: 'request' }, ...prev];
      safeWrite(STORAGE_KEYS.notifications, next);
      return next;
    });
    deps.addActivity(
      getLanguage() === 'th' ? 'อนุมัติคำขอแล้ว' : 'Request approved',
      getLanguage() === 'th' ? `อนุมัติคำขอของ ${found.patientName}` : `${found.patientName} approved`,
      'update',
    );
    deps.showToast(getLanguage() === 'th' ? `อนุมัติ ${found.patientName}` : `Approved ${found.patientName}`, 'success');

    // Dispatch notification
    sendNotification({
      eventType: 'requestApproved',
      title: '✅ Request อนุมัติ',
      message: `${found.patientName} ได้รับการอนุมัติจากแพทย์ผู้เชี่ยวชาญแล้ว`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});

    return true;
  };

  const declineRequest = async (id: string) => {
    const found = deps.requests.find((item) => item.id === id);
    if (!found) return false;
    const language = getLanguage();

    const declinedCase: Case = {
      ...found,
      status: 'Declined',
      lastAction: 'Declined',
      lastActiveTime: createNow(),
    };

    // Persist status change to database
    try {
      await updateCaseDetail(id, { status: 'Declined', lastAction: 'Declined', lastActiveTime: createNow() });
    } catch (err) {
      console.error('[declineRequest] DB update failed:', err);
    }

    deps.setRequests((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    deps.setArchiveCases((prev) => {
      const next = [declinedCase, ...prev];
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    deps.addActivity(
      language === 'th' ? 'ปฏิเสธคำขอแล้ว' : 'Request declined',
      language === 'th' ? `ปฏิเสธคำขอของ ${found.patientName}` : `${found.patientName} declined`,
      'note',
    );
    deps.showToast(language === 'th' ? `ปฏิเสธ ${found.patientName}` : `Declined ${found.patientName}`, 'info');

    // Dispatch notification
    sendNotification({
      eventType: 'caseUpdate',
      title: '❌ Request ปฏิเสธ',
      message: `${found.patientName} ถูกปฏิเสธโดยแพทย์ผู้เชี่ยวชาญ`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});

    return true;
  };

  const closeCase = async (id: string, outcome: 'Discharge' | 'Referred' | 'Dead' = 'Discharge') => {
    const found = deps.activeCases.find((item) => item.id === id);
    if (!found) return;
    const language = getLanguage();

    const archivedCase: Case = {
      ...found,
      status: outcome,
      closeDate: createNow(),
      closedTimestamp: Date.now(),
      lastAction: `Closed: ${outcome}`,
      lastActiveTime: createNow(),
    };

    // Persist status change to database
    try {
      await updateCaseDetail(id, { status: outcome, lastAction: `Closed: ${outcome}`, lastActiveTime: createNow() });
    } catch (err) {
      console.error('[closeCase] DB update failed:', err);
    }

    deps.setActiveCases((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    deps.setArchiveCases((prev) => {
      const next = [archivedCase, ...prev];
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    deps.addActivity(
      language === 'th' ? 'ปิดเคสแล้ว' : 'Case closed',
      language === 'th' ? `ปิดเคสของ ${found.patientName}` : `${found.patientName} closed`,
      'system',
      outcome,
    );
    deps.showToast(language === 'th' ? `ปิดเคส ${found.patientName}` : `Closed ${found.patientName}`, 'success');

    // Dispatch notification
    sendNotification({
      eventType: 'caseUpdate',
      title: `📦 Case ปิด (${outcome})`,
      message: `${found.patientName} ถูกปิดเคสด้วยผลลัพธ์: ${outcome}`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});
  };

  const reactivateCase = async (id: string) => {
    const found = deps.archiveCases.find((item) => item.id === id);
    if (!found) return;
    const language = getLanguage();

    const reopened: Case = {
      ...found,
      status: 'Active',
      closeDate: null,
      closedTimestamp: null,
      lastAction: 'Reactivated',
      lastActiveTime: createNow(),
    };

    // Persist status change to database
    try {
      await updateCaseDetail(id, { status: 'Active', lastAction: 'Reactivated', lastActiveTime: createNow() });
    } catch (err) {
      console.error('[reactivateCase] DB update failed:', err);
    }

    deps.setArchiveCases((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    deps.setActiveCases((prev) => {
      const next = [reopened, ...prev];
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    deps.addActivity(
      language === 'th' ? 'เปิดเคสใหม่แล้ว' : 'Case reactivated',
      language === 'th' ? `เปิดเคสของ ${found.patientName} ใหม่อีกครั้ง` : `${found.patientName} reactivated`,
      'update',
    );
    deps.showToast(language === 'th' ? `เปิดเคสใหม่ ${found.patientName}` : `Reactivated ${found.patientName}`, 'success');

    // Dispatch notification
    sendNotification({
      eventType: 'caseUpdate',
      title: '🔄 Case เปิดใหม่',
      message: `${found.patientName} ถูกเปิดเคสใหม่อีกครั้ง`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});
  };

  const addRequest = async (data: Omit<Case, 'id' | 'status' | 'date'>) => {
    const language = getLanguage();
    const created = await createCase({
      patientName: data.patientName,
      hospital: normalizeHospitalName(data.hospital) || data.hospital,
      priority: data.priority,
      specialty: data.specialty || null,
      reason: data.reason || null,
      senderId: data.senderId || null,
      hn: data.hn || null,
      an: data.an || null,
      cid: data.cid || null,
      age: data.age ?? null,
      phone: data.phone || null,
      dob: data.dob || null,
      district: data.district || null,
      province: data.province || null,
      bloodType: data.bloodType || null,
      gender: data.gender || null,
      allergies: data.allergies || null,
      conditions: data.conditions || null,
      currentSymptoms: data.currentSymptoms || null,
      initialDiagnosis: data.initialDiagnosis || null,
      clinicalNotes: data.clinicalNotes || null,
    });

    const newCase: Case = {
      ...data,
      ...created,
      hospital: normalizeHospitalName(data.hospital) || data.hospital,
      id: created?.id || `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      status: 'Pending',
      date: new Date().toISOString(),
      lastAction: 'Created',
      lastActiveTime: createNow(),
    };
    deps.setRequests((prev) => {
      const next = [newCase, ...prev];
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    deps.addActivity(
      language === 'th' ? 'สร้างคำขอใหม่แล้ว' : 'Request created',
      language === 'th' ? `สร้างคำขอของ ${newCase.patientName}` : `${newCase.patientName} request created`,
      'note',
    );
    deps.showToast(language === 'th' ? `สร้างคำขอ ${newCase.patientName}` : `Created ${newCase.patientName}`, 'success');

    // Dispatch notification
    sendNotification({
      eventType: 'newRequest',
      title: '📋 Consult Request ใหม่',
      message: `${newCase.patientName} — ${newCase.hospital || 'ไม่ระบุโรงพยาบาล'} (${newCase.priority})`,
      caseId: newCase.id,
      priority: newCase.priority,
    }).catch(() => {});

    return newCase.id;
  };

  const markNotificationAsRead = async (id: string) => {
    deps.setNotifications((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, read: true } : item);
      safeWrite(STORAGE_KEYS.notifications, next);
      return next;
    });
  };

  const clearNotifications = async () => {
    deps.setNotifications([]);
    safeWrite(STORAGE_KEYS.notifications, []);
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    deps.setUserProfile((prev) => {
      const next = {
        ...prev,
        ...profile,
        hospital: normalizeHospitalName(profile.hospital ?? prev.hospital),
      };
      const locked = mergeLockedProviderIdentity(next, authService.getSession());
      authService.saveUserProfile(locked);
      return locked;
    });
    deps.showToast(getTranslator()('settings.profileUpdated'), 'success');
  };

  const refreshActivities = async () => {
    deps.setActivities((prev) => {
      const next = [...prev];
      safeWrite(STORAGE_KEYS.activities, next);
      return next;
    });
  };

  return {
    approveRequest,
    declineRequest,
    closeCase,
    reactivateCase,
    addRequest,
    markNotificationAsRead,
    clearNotifications,
    updateUserProfile,
    refreshActivities,
  };
}
