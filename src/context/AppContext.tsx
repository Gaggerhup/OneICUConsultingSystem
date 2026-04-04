'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/auth';

export interface UserProfile {
  id?: string;
  title: string | null;
  firstName: string;
  lastName: string;
  specialty: string | null;
  hospital: string | null;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  isAcceptingCases: boolean;
  isAcceptingNotifications: boolean;
  license?: string | null;
  notifPrefs: {
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    weeklyReport: boolean;
    systemAlert: boolean;
  };
}

export interface Case {
  id: string;
  patientName: string;
  hospital: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Active' | 'Critical' | 'Archived' | 'Discharge' | 'Referred' | 'Dead';
  priority: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
  date?: string | null;
  closeDate?: string | null;
  closedTimestamp?: number | Date | null;
  specialty?: string | null;
  age?: number | null;
  gender?: string | null;
  reason?: string | null;
  type?: 'incoming' | 'sent';
  lastAction?: string | null;
  lastActiveTime?: string | null;
  senderId?: string | null;
  hn?: string | null;
  an?: string | null;
  cid?: string | null;
  bloodType?: string | null;
  allergies?: string[] | null;
  conditions?: string[] | null;
  currentSymptoms?: string | null;
  initialDiagnosis?: string | null;
  clinicalNotes?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'request' | 'message' | 'alert';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ActivityLogItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  details?: string | null;
  icon: 'alert' | 'note' | 'system' | 'update';
  timestamp: number;
}

export interface SpecialistMember extends UserProfile {
  id: string;
  status: 'online' | 'away' | 'dnd';
}

interface AppContextType {
  requests: Case[];
  activeCases: Case[];
  archiveCases: Case[];
  notifications: Notification[];
  selectedCase: Case | null;
  toast: Toast | null;
  userProfile: UserProfile;
  specialists: SpecialistMember[];
  activities: ActivityLogItem[];
  approveRequest: (id: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  closeCase: (id: string, outcome?: 'Discharge' | 'Referred' | 'Dead') => Promise<void>;
  reactivateCase: (id: string) => Promise<void>;
  addRequest: (data: Omit<Case, 'id' | 'status' | 'date'>) => Promise<string>;
  selectCase: (id: string) => void;
  clearSelectedCase: () => void;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshActivities: () => Promise<void>;
  fetchData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  requests: 'app_requests',
  activeCases: 'app_active_cases',
  archiveCases: 'app_archive_cases',
  notifications: 'app_notifications',
  activities: 'app_activities',
  specialists: 'app_specialists',
  selectedCase: 'app_selected_case',
};

const defaultUserProfile: UserProfile = {
  id: 'user_default',
  title: 'Dr.',
  firstName: 'Admin',
  lastName: 'User',
  specialty: 'General Medicine',
  hospital: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
  email: 'admin@example.com',
  avatarUrl: null,
  phoneNumber: '0800000000',
  isAcceptingCases: true,
  isAcceptingNotifications: true,
  license: 'MD-0001',
  notifPrefs: {
    newRequest: true,
    requestApproved: true,
    newMessage: true,
    caseUpdate: true,
    weeklyReport: false,
    systemAlert: true,
  },
};

const createNow = () => new Date().toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const createCaseId = () => `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const createItemId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const normalizeHospitalName = (value: string | null | undefined) => {
  switch ((value || '').trim()) {
    case 'Phitsanulok General Hospital':
    case 'Pitsanulok Hospital':
      return 'โรงพยาบาลพุทธชินราช พิษณุโลก';
    case 'Mueang Phitsanulok Hospital':
      return 'โรงพยาบาลเมืองพิษณุโลก';
    case 'Bang Krathum Hospital':
      return 'โรงพยาบาลบางกระทุ่ม';
    case 'Phrom Phiram Hospital':
      return 'โรงพยาบาลพรหมพิราม';
    case 'Wang Thong Hospital':
      return 'โรงพยาบาลวังทอง';
    default:
      return value || null;
  }
};

const normalizeCaseHospitals = <T extends { hospital: string }>(items: T[]) =>
  items.map((item) => ({
    ...item,
    hospital: normalizeHospitalName(item.hospital) || item.hospital,
  }));

const defaultRequests: Case[] = [
  {
    id: 'REQ-1001',
    patientName: 'Somsak K.',
    hospital: 'โรงพยาบาลเมืองพิษณุโลก',
    status: 'Pending',
    priority: 'URGENT',
    date: 'Apr 2, 2026',
    specialty: 'Cardiology',
    age: 68,
    gender: 'Male',
    reason: 'Chest pain and shortness of breath',
    type: 'incoming',
    lastAction: 'Awaiting review',
    lastActiveTime: '12 min ago',
    senderId: 'user_01',
    hn: 'HN1001',
    an: 'AN1001',
    cid: '1111700200011',
    bloodType: 'A',
    allergies: ['Penicillin'],
    conditions: ['Hypertension'],
    currentSymptoms: 'Severe chest tightness',
    initialDiagnosis: 'Suspected ACS',
    clinicalNotes: 'ECG recommended immediately.',
  },
  {
    id: 'REQ-1002',
    patientName: 'Malee P.',
    hospital: 'โรงพยาบาลบางกระทุ่ม',
    status: 'Pending',
    priority: 'SEMI-URGENT',
    date: 'Apr 2, 2026',
    specialty: 'Internal Medicine',
    age: 54,
    gender: 'Female',
    reason: 'Fever and cough',
    type: 'incoming',
    lastAction: 'Waiting for specialist',
    lastActiveTime: '28 min ago',
    senderId: 'user_02',
    hn: 'HN1002',
    an: 'AN1002',
    cid: '1111700200022',
    bloodType: 'B',
    allergies: [],
    conditions: ['Diabetes'],
    currentSymptoms: 'Fever 38.5 C',
    initialDiagnosis: 'Possible pneumonia',
    clinicalNotes: 'Started empiric antibiotics.',
  },
];

const defaultActiveCases: Case[] = [
  {
    id: 'CASE-2001',
    patientName: 'Niran S.',
    hospital: 'โรงพยาบาลพรหมพิราม',
    status: 'Active',
    priority: 'EMERGENCY',
    date: 'Apr 1, 2026',
    specialty: 'Neurology',
    age: 71,
    gender: 'Male',
    reason: 'Altered consciousness',
    type: 'incoming',
    lastAction: 'Neurology consult in progress',
    lastActiveTime: '5 min ago',
    senderId: 'user_03',
    hn: 'HN2001',
    an: 'AN2001',
    cid: '1111700200033',
    bloodType: 'O',
    allergies: ['Latex'],
    conditions: ['Stroke'],
    currentSymptoms: 'GCS 10',
    initialDiagnosis: 'Acute stroke',
    clinicalNotes: 'CT brain pending.',
  },
  {
    id: 'CASE-2002',
    patientName: 'Sudarat K.',
    hospital: 'โรงพยาบาลวังทอง',
    status: 'Critical',
    priority: 'IMMEDIATE',
    date: 'Apr 1, 2026',
    specialty: 'Pulmonology',
    age: 46,
    gender: 'Female',
    reason: 'Respiratory distress',
    type: 'sent',
    lastAction: 'ICU transfer arranged',
    lastActiveTime: '18 min ago',
    senderId: 'user_04',
    hn: 'HN2002',
    an: 'AN2002',
    cid: '1111700200044',
    bloodType: 'B',
    allergies: [],
    conditions: ['Asthma'],
    currentSymptoms: 'SpO2 88%',
    initialDiagnosis: 'Acute asthma exacerbation',
    clinicalNotes: 'BiPAP started.',
  },
];

const defaultArchiveCases: Case[] = [];

const defaultNotifications: Notification[] = [
  { id: 'notif_1', title: 'New request received', message: 'A new consult request needs attention.', time: '10 min ago', read: false, type: 'request' },
  { id: 'notif_2', title: 'Case updated', message: 'Critical case status changed to Active.', time: '32 min ago', read: false, type: 'alert' },
];

const defaultActivities: ActivityLogItem[] = [
  { id: 'act_1', title: 'Request received', desc: 'Cardiology request created', time: '12 min ago', icon: 'alert', timestamp: Date.now() - 12 * 60 * 1000 },
  { id: 'act_2', title: 'Case reviewed', desc: 'Neurology consult reviewed', time: '40 min ago', icon: 'note', timestamp: Date.now() - 40 * 60 * 1000 },
];

const defaultSpecialists: SpecialistMember[] = [
  {
    id: 'sp_1',
    title: 'Dr.',
    firstName: 'Anong',
    lastName: 'Kittisak',
    specialty: 'Cardiology',
    hospital: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
    email: 'anong@example.com',
    avatarUrl: null,
    phoneNumber: '0811111111',
    isAcceptingCases: true,
    isAcceptingNotifications: true,
    license: 'MD-1001',
    notifPrefs: defaultUserProfile.notifPrefs,
    status: 'online',
  },
];

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

const loadInitialProfile = (): UserProfile => {
  const saved = typeof window === 'undefined' ? null : authService.getUserProfile();
  if (!saved) return defaultUserProfile;
  return {
    ...saved,
    hospital: normalizeHospitalName(saved.hospital),
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [requests, setRequests] = useState<Case[]>(defaultRequests);
  const [activeCases, setActiveCases] = useState<Case[]>(defaultActiveCases);
  const [archiveCases, setArchiveCases] = useState<Case[]>(defaultArchiveCases);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [activities, setActivities] = useState<ActivityLogItem[]>(defaultActivities);
  const [specialists, setSpecialists] = useState<SpecialistMember[]>(defaultSpecialists);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const persistState = useCallback((
    nextRequests: Case[],
    nextActiveCases: Case[],
    nextArchiveCases: Case[],
    nextNotifications: Notification[],
    nextActivities: ActivityLogItem[],
    nextSpecialists: SpecialistMember[],
    nextSelectedCase: Case | null,
  ) => {
    safeWrite(STORAGE_KEYS.requests, nextRequests);
    safeWrite(STORAGE_KEYS.activeCases, nextActiveCases);
    safeWrite(STORAGE_KEYS.archiveCases, nextArchiveCases);
    safeWrite(STORAGE_KEYS.notifications, nextNotifications);
    safeWrite(STORAGE_KEYS.activities, nextActivities);
    safeWrite(STORAGE_KEYS.specialists, nextSpecialists);
    safeWrite(STORAGE_KEYS.selectedCase, nextSelectedCase);
  }, []);

  const refreshFromStorage = useCallback(async () => {
    const nextProfile = loadInitialProfile();
    const nextRequests = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.requests, defaultRequests));
    const nextActiveCases = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.activeCases, defaultActiveCases));
    const nextArchiveCases = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.archiveCases, defaultArchiveCases));
    const nextNotifications = safeRead<Notification[]>(STORAGE_KEYS.notifications, defaultNotifications);
    const nextActivities = safeRead<ActivityLogItem[]>(STORAGE_KEYS.activities, defaultActivities);
    const nextSpecialists = safeRead<SpecialistMember[]>(STORAGE_KEYS.specialists, defaultSpecialists).map((spec) => ({
      ...spec,
      hospital: normalizeHospitalName(spec.hospital) || spec.hospital,
    }));
    const nextSelectedCase = safeRead<Case | null>(STORAGE_KEYS.selectedCase, null);

    setUserProfile(nextProfile);
    setRequests(nextRequests);
    setActiveCases(nextActiveCases);
    setArchiveCases(nextArchiveCases);
    setNotifications(nextNotifications);
    setActivities(nextActivities);
    setSpecialists(nextSpecialists);
    setSelectedCase(nextSelectedCase ? { ...nextSelectedCase, hospital: normalizeHospitalName(nextSelectedCase.hospital) || nextSelectedCase.hospital } : null);
    persistState(nextRequests, nextActiveCases, nextArchiveCases, nextNotifications, nextActivities, nextSpecialists, nextSelectedCase ? { ...nextSelectedCase, hospital: normalizeHospitalName(nextSelectedCase.hospital) || nextSelectedCase.hospital } : null);
  }, [persistState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshFromStorage();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshFromStorage]);

  const addActivity = useCallback((title: string, desc: string, icon: ActivityLogItem['icon'], details?: string | null) => {
    const nextItem: ActivityLogItem = {
      id: createItemId('act'),
      title,
      desc,
      time: 'Just now',
      details: details || null,
      icon,
      timestamp: Date.now(),
    };
    setActivities((prev) => {
      const next = [nextItem, ...prev].slice(0, 50);
      safeWrite(STORAGE_KEYS.activities, next);
      return next;
    });
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const nextToast = { id: createItemId('toast'), message, type };
    setToast(nextToast);
    window.setTimeout(() => {
      setToast((current) => (current?.id === nextToast.id ? null : current));
    }, 2500);
  }, []);

  const updateSelectedCase = useCallback((nextSelected: Case | null) => {
    setSelectedCase(nextSelected);
    safeWrite(STORAGE_KEYS.selectedCase, nextSelected);
  }, []);

  const selectCase = useCallback((id: string) => {
    const found = [...requests, ...activeCases, ...archiveCases].find((item) => item.id === id) || null;
    updateSelectedCase(found);
  }, [activeCases, archiveCases, requests, updateSelectedCase]);

  const clearSelectedCase = useCallback(() => {
    updateSelectedCase(null);
  }, [updateSelectedCase]);

  const approveRequest = useCallback(async (id: string) => {
    const found = requests.find((item) => item.id === id);
    if (!found) return;

    const approvedCase: Case = {
      ...found,
      status: 'Active',
      lastAction: 'Approved',
      lastActiveTime: createNow(),
    };

    setRequests((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    setActiveCases((prev) => {
      const next = [approvedCase, ...prev];
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    setNotifications((prev) => {
      const next = [{ id: createItemId('notif'), title: 'Request approved', message: `${found.patientName} was approved.`, time: 'Just now', read: false, type: 'request' }, ...prev];
      safeWrite(STORAGE_KEYS.notifications, next);
      return next;
    });
    addActivity('Request approved', `${found.patientName} approved`, 'update');
    showToast(`Approved ${found.patientName}`, 'success');
  }, [addActivity, requests, showToast]);

  const declineRequest = useCallback(async (id: string) => {
    const found = requests.find((item) => item.id === id);
    if (!found) return;

    const declinedCase: Case = {
      ...found,
      status: 'Declined',
      lastAction: 'Declined',
      lastActiveTime: createNow(),
    };

    setRequests((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    setArchiveCases((prev) => {
      const next = [declinedCase, ...prev];
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    addActivity('Request declined', `${found.patientName} declined`, 'note');
    showToast(`Declined ${found.patientName}`, 'info');
  }, [addActivity, requests, showToast]);

  const closeCase = useCallback(async (id: string, outcome: 'Discharge' | 'Referred' | 'Dead' = 'Discharge') => {
    const found = activeCases.find((item) => item.id === id);
    if (!found) return;

    const archivedCase: Case = {
      ...found,
      status: outcome,
      closeDate: createNow(),
      closedTimestamp: Date.now(),
      lastAction: `Closed: ${outcome}`,
      lastActiveTime: createNow(),
    };

    setActiveCases((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    setArchiveCases((prev) => {
      const next = [archivedCase, ...prev];
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    addActivity('Case closed', `${found.patientName} closed`, 'system', outcome);
    showToast(`Closed ${found.patientName}`, 'success');
  }, [activeCases, addActivity, showToast]);

  const reactivateCase = useCallback(async (id: string) => {
    const found = archiveCases.find((item) => item.id === id);
    if (!found) return;

    const reopened: Case = {
      ...found,
      status: 'Active',
      closeDate: null,
      closedTimestamp: null,
      lastAction: 'Reactivated',
      lastActiveTime: createNow(),
    };

    setArchiveCases((prev) => {
      const next = prev.filter((item) => item.id !== id);
      safeWrite(STORAGE_KEYS.archiveCases, next);
      return next;
    });
    setActiveCases((prev) => {
      const next = [reopened, ...prev];
      safeWrite(STORAGE_KEYS.activeCases, next);
      return next;
    });
    addActivity('Case reactivated', `${found.patientName} reactivated`, 'update');
    showToast(`Reactivated ${found.patientName}`, 'success');
  }, [addActivity, archiveCases, showToast]);

  const addRequest = useCallback(async (data: Omit<Case, 'id' | 'status' | 'date'>) => {
    const newCase: Case = {
      ...data,
      hospital: normalizeHospitalName(data.hospital) || data.hospital,
      id: createCaseId(),
      status: 'Pending',
      date: new Date().toISOString(),
      lastAction: 'Created',
      lastActiveTime: createNow(),
    };
    setRequests((prev) => {
      const next = [newCase, ...prev];
      safeWrite(STORAGE_KEYS.requests, next);
      return next;
    });
    addActivity('Request created', `${newCase.patientName} request created`, 'note');
    showToast(`Created ${newCase.patientName}`, 'success');
    return newCase.id;
  }, [addActivity, showToast]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, read: true } : item);
      safeWrite(STORAGE_KEYS.notifications, next);
      return next;
    });
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
    safeWrite(STORAGE_KEYS.notifications, []);
  }, []);

  const updateUserProfile = useCallback(async (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = {
        ...prev,
        ...profile,
        hospital: normalizeHospitalName(profile.hospital ?? prev.hospital),
      };
      authService.saveUserProfile(next);
      return next;
    });
    showToast('Profile updated', 'success');
  }, [showToast]);

  const refreshActivities = useCallback(async () => {
    setActivities((prev) => {
      const next = [...prev];
      safeWrite(STORAGE_KEYS.activities, next);
      return next;
    });
  }, []);

  const value = useMemo<AppContextType>(() => ({
    requests,
    activeCases,
    archiveCases,
    notifications,
    selectedCase,
    toast,
    userProfile,
    specialists,
    activities,
    approveRequest,
    declineRequest,
    closeCase,
    reactivateCase,
    addRequest,
    selectCase,
    clearSelectedCase,
    markNotificationAsRead,
    clearNotifications,
    showToast,
    updateUserProfile,
    refreshActivities,
    fetchData: refreshFromStorage,
  }), [
    addRequest,
    activeCases,
    activities,
    approveRequest,
    archiveCases,
    clearNotifications,
    clearSelectedCase,
    closeCase,
    declineRequest,
    markNotificationAsRead,
    reactivateCase,
    refreshFromStorage,
    requests,
    selectedCase,
    specialists,
    showToast,
    toast,
    updateUserProfile,
    userProfile,
    notifications,
    refreshActivities,
    selectCase,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
