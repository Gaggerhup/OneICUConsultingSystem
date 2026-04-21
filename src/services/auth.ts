/**
 * Provider ID Authentication Service
 * 
 * This service handles the OAuth flow with Health ID and Provider ID.
 */

const HEALTH_ID_URL = process.env.NEXT_PUBLIC_HEALTH_BASE_URL || 'https://uat-moph.id.th';
const PROVIDER_ID_URL = process.env.NEXT_PUBLIC_PROVIDER_BASE_URL || 'https://uat-provider.id.th';

// Constants for OAuth configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_HEALTH_CLIENT_ID || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_HEALTH_REDIRECT_URI || '';
const HEALTH_CLIENT_SECRET = process.env.NEXT_PUBLIC_HEALTH_CLIENT_SECRET || '';
const PROVIDER_CLIENT_ID = process.env.NEXT_PUBLIC_PROVIDER_CLIENT_ID || '';
const PROVIDER_CLIENT_SECRET = process.env.NEXT_PUBLIC_PROVIDER_CLIENT_SECRET || '';
const CALLBACK_PATH = '/api/auth/healthid';

const resolveRedirectUri = (override?: string) => {
  if (override) return override;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${CALLBACK_PATH}`;
  }
  return REDIRECT_URI;
};

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
      return value || '';
  }
};

export const authService = {
  /**
   * Redirect users to the Health ID OAuth portal
   */
  redirectToLogin: (redirectUri?: string) => {
    const resolvedRedirectUri = resolveRedirectUri(redirectUri);
    const url = new URL('/oauth/redirect', HEALTH_ID_URL);
    url.search = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: resolvedRedirectUri,
      response_type: 'code',
    }).toString();
    window.location.href = url;
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
        client_id: CLIENT_ID,
        client_secret: HEALTH_CLIENT_SECRET
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
    if (!profile) return null;

    // Rule 1: Title prefix logic
    // Use special_title_en first (e.g. "Dr.", "RN"), fallback to title_en (e.g. "Mr.", "Mrs.")
    const specialTitle = (profile.special_title_en || '').toLowerCase();
    const titleEn = (profile.title_en || '').toLowerCase();
    const position = ((profile.organization?.[0]?.position) || '').toLowerCase();

    let title = 'Dr.'; // default
    if (
      specialTitle.includes('rn') ||
      specialTitle.includes('nurse') ||
      position.includes('nurse') ||
      position.includes('พยาบาล')
    ) {
      title = 'RN';
    } else if (
      specialTitle.includes('dr') ||
      titleEn.includes('dr') ||
      position.includes('แพทย์') ||
      position.includes('doctor') ||
      position.includes('physician')
    ) {
      title = 'Dr.';
    }

    // Rule 2: Use Thai name (firstname_th + lastname_th)
    const firstName = profile.firstname_th || profile.firstname_en || '';
    const lastName = profile.lastname_th || profile.lastname_en || '';

    // Rule 3: License from first organization entry (may be null for non-licensed roles)
    const firstOrg = profile.organization?.[0];
    const license = firstOrg?.license_id || '';

    // Rule 4: Specialty — default empty (user fills in manually)
    const specialty = '';

    // Rule 5: Primary Hospital from first organization entry
    const hospital = normalizeHospitalName(firstOrg?.hname_th || firstOrg?.hname_eng || '');

    // Email from root level; phone not provided by Provider ID API
    const email = profile.email || '';

    return {
      title,
      firstName,
      lastName,
      specialty,
      hospital,
      email,
      phoneNumber: '+66', // Phone not available in Provider ID API
      avatarUrl: null,
      license,
      isAcceptingCases: true,
      notifPrefs: {
        newRequest: true,
        requestApproved: true,
        newMessage: true,
        caseUpdate: true,
        weeklyReport: true,
        systemAlert: true,
      }
    };
  },

  /**
   * Save raw Provider ID session (overwritten on every login)
   */
  saveSession: (profile: any) => {
    localStorage.setItem('provider_session', JSON.stringify(profile));
    
    // Set a cookie for Next.js Middleware to check on the server-side
    // This is required because middleware cannot access localStorage
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
    document.cookie = `auth_session=true; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
  },

  /**
   * Get current raw Provider ID session
   */
  getSession: () => {
    const session = localStorage.getItem('provider_session');
    return session ? JSON.parse(session) : null;
  },

  /**
   * Initialize profile on first login for this account.
   * 
   * - First login (no prior init for this account_id): applies Provider ID defaults,
   *   saves to user_profile, marks this account as initialized.
   * - Subsequent logins: does nothing — user_profile is already set.
   * - After deactivation: profile_initialized_for is cleared, so the next login
   *   is treated as a first login.
   * 
   * @param rawProfile - The raw profile data from Provider ID API
   */
  initializeProfile: (rawProfile: any) => {
    const accountId = rawProfile?.account_id || '';
    const initializedFor = localStorage.getItem('profile_initialized_for');

    // Only apply defaults if this is the first login for this account
    if (initializedFor !== accountId) {
      const mapped = authService.mapProfile(rawProfile);
      if (mapped) {
        localStorage.setItem('user_profile', JSON.stringify(mapped));
        localStorage.setItem('profile_initialized_for', accountId);
      }
    }
  },

  /**
   * Get user-edited profile (persists across logins).
   * Falls back to Provider ID defaults if not set.
   */
  getUserProfile: () => {
    const saved = localStorage.getItem('user_profile');
    if (saved) return JSON.parse(saved);
    // Fallback: map from raw session if user_profile not set yet
    const session = localStorage.getItem('provider_session');
    if (session) {
      const raw = JSON.parse(session);
      // If it's already mapped (has 'firstName'), use directly
      if (raw.firstName !== undefined) return raw;
      return authService.mapProfile(raw);
    }
    return null;
  },

  /**
   * Save user-edited profile to localStorage.
   * Call this when the user saves changes in Settings > Profile.
   */
  saveUserProfile: (profile: any) => {
    const normalized = {
      ...profile,
      hospital: normalizeHospitalName(profile?.hospital),
    };
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
   * Setup a mock session for development/testing bypass.
   */
  setupMockSession: () => {
    const mockProfile = {
      account_id: 'dev_mock_user',
      firstname_th: 'Dev',
      lastname_th: 'Mode',
      email: 'dev@example.com',
      organization: [{
        hname_th: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
        license_id: 'DEV-12345'
      }]
    };
    localStorage.setItem('provider_session', JSON.stringify(mockProfile));
    
    // Set a cookie for Next.js Middleware
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1); // 1 day
    document.cookie = `auth_session=true; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
    
    // Initialize profile
    authService.initializeProfile(mockProfile);
    
    window.location.href = '/dashboard';
  },

  /**
   * Clear session on logout
   */
  logout: () => {
    localStorage.removeItem('provider_session');
    // Clear the auth cookie
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  },

  /**
   * Resolve the callback URL used by the current host.
   */
  getCallbackUrl: () => resolveRedirectUri(),
};
