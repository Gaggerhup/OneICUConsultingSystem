import { authService } from '@/services/auth';
import { normalizeHospitalName } from '@/lib/provider-profile';
import type { ActivityLogItem, Case, Notification, SpecialistMember, UserProfile } from '@/context/AppContext';

export const STORAGE_KEYS = {
  requests: 'app_requests',
  activeCases: 'app_active_cases',
  archiveCases: 'app_archive_cases',
  notifications: 'app_notifications',
  activities: 'app_activities',
  specialists: 'app_specialists',
  selectedCase: 'app_selected_case',
} as const;

export const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const safeWrite = (key: string, value: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const normalizeCaseHospitals = <T extends { hospital: string }>(items: T[]) =>
  items.map((item) => ({
    ...item,
    hospital: normalizeHospitalName(item.hospital) || item.hospital,
  }));

export const loadInitialProfile = (defaultProfile: UserProfile): UserProfile => {
  const saved = typeof window === 'undefined' ? null : authService.getUserProfile();
  if (!saved) return defaultProfile;
  return {
    ...saved,
    hospital: normalizeHospitalName(saved.hospital),
  };
};

export const persistAppState = (
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
};
