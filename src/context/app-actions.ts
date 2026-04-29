import type { Dispatch, SetStateAction } from 'react';
import type { ActivityLogItem, Case, Notification, SpecialistMember, Toast, UserProfile } from '@/context/AppContext';
import { authService } from '@/services/auth';
import { mergeLockedProviderIdentity, normalizeHospitalName } from '@/lib/provider-profile';
import { safeWrite, STORAGE_KEYS } from '@/lib/app-state';
import { sendNotification } from '@/actions/sendNotification';

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

export function createAppActions(deps: AppActionDeps) {
  const approveRequest = async (id: string) => {
    const found = deps.requests.find((item) => item.id === id);
    if (!found) return;

    const approvedCase: Case = {
      ...found,
      status: 'Active',
      lastAction: 'Approved',
      lastActiveTime: createNow(),
    };

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
      const next = [{ id: createItemId('notif'), title: 'Request approved', message: `${found.patientName} was approved.`, time: 'Just now', read: false, type: 'request' }, ...prev];
      safeWrite(STORAGE_KEYS.notifications, next);
      return next;
    });
    deps.addActivity('Request approved', `${found.patientName} approved`, 'update');
    deps.showToast(`Approved ${found.patientName}`, 'success');

    // Dispatch notification
    sendNotification({
      eventType: 'requestApproved',
      title: '✅ Request อนุมัติ',
      message: `${found.patientName} ได้รับการอนุมัติจากแพทย์ผู้เชี่ยวชาญแล้ว`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});
  };

  const declineRequest = async (id: string) => {
    const found = deps.requests.find((item) => item.id === id);
    if (!found) return;

    const declinedCase: Case = {
      ...found,
      status: 'Declined',
      lastAction: 'Declined',
      lastActiveTime: createNow(),
    };

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
    deps.addActivity('Request declined', `${found.patientName} declined`, 'note');
    deps.showToast(`Declined ${found.patientName}`, 'info');

    // Dispatch notification
    sendNotification({
      eventType: 'caseUpdate',
      title: '❌ Request ปฏิเสธ',
      message: `${found.patientName} ถูกปฏิเสธโดยแพทย์ผู้เชี่ยวชาญ`,
      caseId: id,
      priority: found.priority,
    }).catch(() => {});
  };

  const closeCase = async (id: string, outcome: 'Discharge' | 'Referred' | 'Dead' = 'Discharge') => {
    const found = deps.activeCases.find((item) => item.id === id);
    if (!found) return;

    const archivedCase: Case = {
      ...found,
      status: outcome,
      closeDate: createNow(),
      closedTimestamp: Date.now(),
      lastAction: `Closed: ${outcome}`,
      lastActiveTime: createNow(),
    };

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
    deps.addActivity('Case closed', `${found.patientName} closed`, 'system', outcome);
    deps.showToast(`Closed ${found.patientName}`, 'success');

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

    const reopened: Case = {
      ...found,
      status: 'Active',
      closeDate: null,
      closedTimestamp: null,
      lastAction: 'Reactivated',
      lastActiveTime: createNow(),
    };

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
    deps.addActivity('Case reactivated', `${found.patientName} reactivated`, 'update');
    deps.showToast(`Reactivated ${found.patientName}`, 'success');

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
    const newCase: Case = {
      ...data,
      hospital: normalizeHospitalName(data.hospital) || data.hospital,
      id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
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
    deps.addActivity('Request created', `${newCase.patientName} request created`, 'note');
    deps.showToast(`Created ${newCase.patientName}`, 'success');

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
    deps.showToast('Profile updated', 'success');
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
