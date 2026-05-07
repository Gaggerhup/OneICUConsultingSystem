/**
 * Provider ID Authentication Service
 * 
 * This service handles the OAuth flow with Health ID and Provider ID.
 */

import {
  mapProviderIdentity,
  mergeLockedProviderIdentity,
  normalizeHospitalName,
} from '@/lib/provider-profile';
import { authEnv } from '@/lib/auth-env';
import { resolveClientHealthRedirectUri } from '@/lib/oauth-urls';

const HEALTH_ID_URL = authEnv.healthBaseUrl() || 'https://uat-moph.id.th';
const PROVIDER_ID_URL = authEnv.providerBaseUrl() || 'https://uat-provider.id.th';

// Constants for OAuth configuration
const OAUTH_CLIENT_ID = authEnv.healthClientId();
const REDIRECT_URI = authEnv.healthRedirectUri();
const OAUTH_CLIENT_SECRET = authEnv.healthClientSecret();
const PROVIDER_CLIENT_ID = authEnv.providerClientId();
const PROVIDER_CLIENT_SECRET = authEnv.providerClientSecret();
const resolveRedirectUri = (override?: string) => {
  if (override) return override;
  if (REDIRECT_URI) return REDIRECT_URI;
  return resolveClientHealthRedirectUri();
};

const safeParse = <T,>(raw: string | null, fallback: T, storageKey?: string): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.removeItem(storageKey);
    }
    return fallback;
  }
};

export type AuthSessionMeta = {
  lastUsedAt: string;
  userAgent?: string;
  platform?: string;
};

export type ServerAuthSession = {
  id: string;
  accountId: string;
  device: string;
  ipAddress: string | null;
  userAgent: string | null;
  platform: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
  isOnline: boolean;
  lastSeenSecondsAgo: number;
};

export const authService = {
  /**
   * Redirect users to the Provider ID login entry point.
   * The server route handles the Health ID handoff and keeps the
   * browser flow consistent across environments.
   */
  redirectToProviderLogin: () => {
    window.location.href = '/api/auth/provider-login';
  },

  /**
   * Backward-compatible alias for existing callers.
   */
  redirectToLogin: (_redirectUri?: string) => {
    authService.redirectToProviderLogin();
  },

  /**
   * Exchange authorization code for Health ID access token
   */
  exchangeCode: async (code: string) => {
    const resolvedRedirectUri = resolveRedirectUri();
    const response = await fetch(`${HEALTH_ID_URL}/api/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: resolvedRedirectUri,
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET
      }),
    });
    return response.json();
  },

  /**
   * Get Provider ID Access Token using Health ID token
   */
  getProviderToken: async (healthToken: string) => {
    const response = await fetch(`${PROVIDER_ID_URL}/api/v1/services/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PROVIDER_CLIENT_ID,
        secret_key: PROVIDER_CLIENT_SECRET,
        token_by: 'Health ID',
        token: healthToken,
      }),
    });
    return response.json();
  },

  /**
   * Fetch user profile from Provider ID
   */
  getProfile: async (providerToken: string) => {
    const response = await fetch(`${PROVIDER_ID_URL}/api/v1/services/profile?position_type=1`, {
      method: 'GET',
      headers: {
        'client-id': PROVIDER_CLIENT_ID,
        'secret-key': PROVIDER_CLIENT_SECRET,
        'Authorization': `Bearer ${providerToken}`,
      },
    });
    return response.json();
  },

  /**
   * Map Provider ID profile data to our application's UserProfile schema.
   * Field names based on the official Provider ID API specification:
   * https://github.com/tehnplk/provider-id-guide/blob/main/PROVIDER_ID.MD
   */
  mapProfile: (profile: any) => {
    return mapProviderIdentity(profile);
  },

  /**
   * Save raw Provider ID session (overwritten on every login)
   */
  saveSession: (profile: any) => {
    localStorage.setItem('provider_session', JSON.stringify(profile));
    localStorage.setItem('auth_session_meta', JSON.stringify({
      lastUsedAt: new Date().toISOString(),
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
    } satisfies AuthSessionMeta));

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    document.cookie = `auth_session=true; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
  },

  getServerSessions: async () => {
    const response = await fetch('/api/auth/sessions', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Failed to load server sessions');
    }

    const payload = await response.json();
    return (payload.sessions || []) as ServerAuthSession[];
  },

  revokeServerSession: async (id: string) => {
    const response = await fetch(`/api/auth/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Failed to revoke server session');
    }

    return response.json();
  },

  heartbeatServerSession: async () => {
    const response = await fetch('/api/auth/sessions', {
      method: 'PATCH',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Failed to refresh server session');
    }

    return response.json();
  },

  /**
   * Get current raw Provider ID session
   */
  getSession: () => {
    const session = localStorage.getItem('provider_session');
    return safeParse<Record<string, unknown> | null>(session, null, 'provider_session');
  },

  /**
   * Get metadata for the current browser session.
   */
  getSessionMeta: () => {
    const meta = localStorage.getItem('auth_session_meta');
    return safeParse<AuthSessionMeta | null>(meta, null, 'auth_session_meta');
  },

  /**
   * Initialize profile data from Provider ID.
   *
   * The locked identity fields must stay in sync with the latest Provider ID
   * payload, while user-editable fields remain preserved in localStorage.
   * 
   * @param rawProfile - The raw profile data from Provider ID API
   */
  initializeProfile: (rawProfile: any) => {
    const accountId =
      rawProfile?.account_id ||
      rawProfile?.member_id ||
      rawProfile?.user_id ||
      rawProfile?.provider_id ||
      rawProfile?.cid ||
      '';
    const mapped = authService.mapProfile(rawProfile);
    if (!mapped) {
      return;
    }

    const existing = safeParse<Record<string, any> | null>(
      localStorage.getItem('user_profile'),
      null,
      'user_profile',
    );
    const nextProfile = existing
      ? {
          ...existing,
          ...mapped,
          title: mapped.title || existing.title,
          firstName: mapped.firstName || existing.firstName,
          lastName: mapped.lastName || existing.lastName,
          hospital: mapped.hospital || existing.hospital,
          license: mapped.license || existing.license,
        }
      : mapped;

    localStorage.setItem('user_profile', JSON.stringify(nextProfile));
    if (accountId) {
      localStorage.setItem('profile_initialized_for', accountId);
    }
  },

  /**
   * Get user-edited profile (persists across logins).
   * Falls back to Provider ID defaults if not set.
   */
  getUserProfile: () => {
    const saved = localStorage.getItem('user_profile');
    const session = localStorage.getItem('provider_session');
    const parsedSaved = safeParse<Record<string, any> | null>(saved, null, 'user_profile');
    if (parsedSaved) {
      if (session) {
        const raw = safeParse<Record<string, any> | null>(session, null, 'provider_session');
        const identity = mapProviderIdentity(raw);
        return identity
          ? {
              ...parsedSaved,
              ...identity,
              title: identity.title || parsedSaved.title,
              firstName: identity.firstName || parsedSaved.firstName,
              lastName: identity.lastName || parsedSaved.lastName,
              license: identity.license || parsedSaved.license,
              hospital: identity.hospital || normalizeHospitalName(parsedSaved.hospital),
            }
          : parsedSaved;
      }
      return parsedSaved;
    }
    if (session) {
      const raw = safeParse<Record<string, any> | null>(session, null, 'provider_session');
      if (!raw) return null;
      if (raw.firstName !== undefined) {
        const identity = mapProviderIdentity(raw);
        return identity ? { ...raw, ...identity } : raw;
      }
      return authService.mapProfile(raw);
    }
    return null;
  },

  /**
   * Save user-edited profile to localStorage.
   * Call this when the user saves changes in Settings > Profile.
   */
  saveUserProfile: (profile: any) => {
    const session = authService.getSession();
    const normalized = mergeLockedProviderIdentity({
      ...profile,
      hospital: normalizeHospitalName(profile?.hospital),
    }, session);
    localStorage.setItem('user_profile', JSON.stringify(normalized));
  },

  /**
   * Clear the initialization flag so the next login is treated as a first login.
   * Call this when the user deactivates their account.
   */
  clearProfileInitialization: () => {
    localStorage.removeItem('profile_initialized_for');
    localStorage.removeItem('user_profile');
  },

  /**
   * Clear all local auth state without redirecting.
   */
  clearSession: () => {
    localStorage.removeItem('provider_session');
    localStorage.removeItem('auth_session_meta');
    localStorage.removeItem('profile_initialized_for');
    localStorage.removeItem('user_profile');
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  },

  /**
   * Setup a local test session for development and network-restricted demos.
   */
  setupTestSession: () => {
    const mockProfile = {
      account_id: 'test_provider_user',
      provider_id: 'TEST-PROVIDER-001',
      title_th: 'นพ.',
      title_en: 'Dr.',
      special_title_th: 'แพทย์',
      special_title_en: 'Doctor',
      name_th: 'แพทย์ ทดสอบระบบ',
      name_eng: 'Test Provider',
      firstname_th: 'แพทย์',
      lastname_th: 'ทดสอบระบบ',
      firstname_en: 'Test',
      lastname_en: 'Provider',
      email: 'test.provider@example.local',
      organization: [
        {
          position: 'แพทย์เวชศาสตร์ฉุกเฉิน',
          position_type: 'แพทย์',
          license_id: 'TEST-12345',
          hcode: '10670',
          hname_th: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
          hname_eng: 'Buddhachinaraj Phitsanulok Hospital',
          expertise: 'Emergency Medicine',
          address: {
            province: 'พิษณุโลก',
            district: 'เมืองพิษณุโลก',
            sub_district: 'ในเมือง',
            zip_code: '65000',
          },
        },
      ],
    };

    authService.saveSession(mockProfile);
    authService.initializeProfile(mockProfile);
    window.location.href = '/dashboard';
  },

  /**
   * Clear session on logout
   */
  logout: () => {
    authService.clearSession();
    window.location.href = '/login';
  },

  /**
   * Resolve the callback URL used by the current host.
   */
  getCallbackUrl: () => resolveRedirectUri(),
};
