'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getActivities } from '@/actions/activities';
import { getCases } from '@/actions/cases';
import { getSpecialists } from '@/actions/users';
import { canAccessHospital, normalizeHospitalName } from '@/lib/provider-profile';
import { authService } from '@/services/auth';
import {
  STORAGE_KEYS,
  loadInitialProfile,
  normalizeCaseHospitals,
  persistAppState,
  safeRead,
  safeWrite,
} from '@/lib/app-state';
import { createAppActions } from '@/context/app-actions';
import {
  defaultActivities,
  defaultActiveCases,
  defaultArchiveCases,
  defaultNotifications,
  defaultRequests,
  defaultSpecialists,
  defaultUserProfile,
} from '@/lib/app-defaults';

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
  telegramChatId: string | null;
  summary?: string | null;
  notifPrefs: {
    telegram: boolean;
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    systemAlert: boolean;
  };
}

export interface Case {
  id: string;
  patientName: string;
  hospital: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Cancelled' | 'Active' | 'Critical' | 'Inactive' | 'Archived' | 'Discharge' | 'Referred' | 'Dead' | 'Step Down';
  priority: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
  date?: string | null;
  requestedAt?: string | null;
  approvedAt?: string | null;
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
  phone?: string | null;
  dob?: string | null;
  district?: string | null;
  province?: string | null;
  bloodType?: string | null;
  allergies?: string[] | null;
  conditions?: string[] | null;
  chiefComplaint?: string | null;
  presentIllness?: string | null;
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
  approveRequest: (id: string) => Promise<boolean>;
  declineRequest: (id: string) => Promise<boolean>;
  cancelRequest: (id: string) => Promise<boolean>;
  closeCase: (id: string, outcome?: 'Discharge' | 'Referred' | 'Dead' | 'Step Down') => Promise<void>;
  reactivateCase: (id: string) => Promise<'requests' | 'active' | false>;
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

const createItemId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const isRequestStatus = (status: Case['status']) => status === 'Pending';
const isArchiveStatus = (status: Case['status']) => ['Archived', 'Declined', 'Cancelled', 'Discharge', 'Referred', 'Dead', 'Step Down'].includes(status);
const isConsultCaseStatus = (status: Case['status']) => ['Approved', 'Active', 'Critical'].includes(status);

const mergeCaseBucket = (
  storedCases: Case[],
  dbCases: Case[],
  statusMatcher: (status: Case['status']) => boolean,
  userHospital: string | null | undefined,
) => {
  const visibleDbCases = dbCases.filter((item) => (
    statusMatcher(item.status) && canAccessHospital(userHospital, item.hospital)
  ));
  const dbCaseIds = new Set(dbCases.map((item) => item.id));
  const preservedStoredCases = storedCases.filter((item) => (
    !dbCaseIds.has(item.id) && canAccessHospital(userHospital, item.hospital)
  ));

  return [...preservedStoredCases, ...visibleDbCases];
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

  useEffect(() => {
    if (!authService.getSession()) return;

    const heartbeat = () => {
      authService.heartbeatServerSession().catch(() => {
        // Keep local fallback auth usable if the session API is temporarily unavailable.
      });
    };

    heartbeat();
    const intervalId = window.setInterval(heartbeat, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') heartbeat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const refreshFromStorage = useCallback(async () => {
    const nextProfile = loadInitialProfile(defaultUserProfile);
    const storedRequests = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.requests, defaultRequests));
    const storedActiveCases = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.activeCases, defaultActiveCases));
    const storedArchiveCases = normalizeCaseHospitals(safeRead<Case[]>(STORAGE_KEYS.archiveCases, defaultArchiveCases));
    const nextNotifications = safeRead<Notification[]>(STORAGE_KEYS.notifications, defaultNotifications);
    const storedActivities = safeRead<ActivityLogItem[]>(STORAGE_KEYS.activities, defaultActivities);
    const storedSpecialists = safeRead<SpecialistMember[]>(STORAGE_KEYS.specialists, defaultSpecialists).map((spec) => ({
      ...spec,
      hospital: normalizeHospitalName(spec.hospital) || spec.hospital,
    }));

    let nextRequests = storedRequests;
    let nextActiveCases = storedActiveCases;
    let nextArchiveCases = storedArchiveCases;
    let nextActivities = storedActivities;
    let nextSpecialists = storedSpecialists;

    try {
      const [dbCases, dbSpecialists, dbActivities] = await Promise.all([
        getCases(),
        getSpecialists(),
        getActivities(),
      ]);

      if (dbCases.length > 0) {
        const normalizedCases = normalizeCaseHospitals(dbCases as Case[]);
        const visibleCases = normalizedCases.filter((item) => canAccessHospital(nextProfile.hospital, item.hospital));

        nextRequests = mergeCaseBucket(storedRequests, visibleCases, isRequestStatus, nextProfile.hospital);
        nextArchiveCases = mergeCaseBucket(storedArchiveCases, visibleCases, isArchiveStatus, nextProfile.hospital);
        nextActiveCases = mergeCaseBucket(storedActiveCases, visibleCases, isConsultCaseStatus, nextProfile.hospital);
      }

      if (dbSpecialists.length > 0) {
        nextSpecialists = (dbSpecialists as SpecialistMember[]).map((spec) => ({
          ...spec,
          hospital: normalizeHospitalName(spec.hospital) || spec.hospital,
          status: spec.status || 'online',
        }));
      }

      if (dbActivities.length > 0) {
        nextActivities = (dbActivities as ActivityLogItem[]).map((item) => ({
          ...item,
          icon: item.icon || 'system',
        }));
      }
    } catch (error) {
      console.error('[AppContext] Database refresh failed, using local fallback:', error);
    }

    nextRequests = nextRequests.filter((item) => canAccessHospital(nextProfile.hospital, item.hospital));
    nextActiveCases = nextActiveCases.filter((item) => canAccessHospital(nextProfile.hospital, item.hospital));
    nextArchiveCases = nextArchiveCases.filter((item) => canAccessHospital(nextProfile.hospital, item.hospital));

    const storedSelectedCase = safeRead<Case | null>(STORAGE_KEYS.selectedCase, null);
    const allCases = [...nextRequests, ...nextActiveCases, ...nextArchiveCases];
    const nextSelectedCase = storedSelectedCase && canAccessHospital(nextProfile.hospital, storedSelectedCase.hospital)
      ? allCases.find((item) => item.id === storedSelectedCase.id) || storedSelectedCase
      : null;

    setUserProfile(nextProfile);
    setRequests(nextRequests);
    setActiveCases(nextActiveCases);
    setArchiveCases(nextArchiveCases);
    setNotifications(nextNotifications);
    setActivities(nextActivities);
    setSpecialists(nextSpecialists);
    setSelectedCase(nextSelectedCase ? { ...nextSelectedCase, hospital: normalizeHospitalName(nextSelectedCase.hospital) || nextSelectedCase.hospital } : null);
    persistAppState(nextRequests, nextActiveCases, nextArchiveCases, nextNotifications, nextActivities, nextSpecialists, nextSelectedCase ? { ...nextSelectedCase, hospital: normalizeHospitalName(nextSelectedCase.hospital) || nextSelectedCase.hospital } : null);
  }, []);

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

  const appActions = useMemo(() => createAppActions({
    requests,
    activeCases,
    archiveCases,
    activities,
    setRequests,
    setActiveCases,
    setArchiveCases,
    setNotifications,
    setActivities,
    setUserProfile,
    showToast,
    addActivity,
  }), [
    activeCases,
    activities,
    addActivity,
    archiveCases,
    requests,
    setActiveCases,
    setActivities,
    setArchiveCases,
    setNotifications,
    setRequests,
    setUserProfile,
    showToast,
  ]);

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
    approveRequest: appActions.approveRequest,
    declineRequest: appActions.declineRequest,
    cancelRequest: appActions.cancelRequest,
    closeCase: appActions.closeCase,
    reactivateCase: appActions.reactivateCase,
    addRequest: appActions.addRequest,
    selectCase,
    clearSelectedCase,
    markNotificationAsRead: appActions.markNotificationAsRead,
    clearNotifications: appActions.clearNotifications,
    showToast,
    updateUserProfile: appActions.updateUserProfile,
    refreshActivities: appActions.refreshActivities,
    fetchData: refreshFromStorage,
  }), [
    activeCases,
    activities,
    archiveCases,
    clearSelectedCase,
    appActions,
    refreshFromStorage,
    requests,
    selectedCase,
    specialists,
    showToast,
    toast,
    userProfile,
    notifications,
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
