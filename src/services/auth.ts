/**
 * Provider ID Authentication Service
 * 
 * This service handles the OAuth flow with moph.id.th and provider.id.th.
 */

const HEALTH_ID_URL = 'https://moph.id.th';
const PROVIDER_ID_URL = 'https://provider.id.th';

// Constants for OAuth configuration
const CLIENT_ID = import.meta.env.VITE_HEALTH_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_HEALTH_REDIRECT_URI;
const HEALTH_CLIENT_SECRET = import.meta.env.VITE_HEALTH_CLIENT_SECRET;
const PROVIDER_CLIENT_ID = import.meta.env.VITE_PROVIDER_CLIENT_ID;
const PROVIDER_CLIENT_SECRET = import.meta.env.VITE_PROVIDER_CLIENT_SECRET;

export const authService = {
  /**
   * Redirect users to the moph.id.th OAuth portal
   */
  redirectToLogin: () => {
    const url = `${HEALTH_ID_URL}/oauth/redirect?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = url;
  },

  /**
   * Exchange authorization code for Health ID access token
   */
  exchangeCode: async (code: string) => {
    const response = await fetch(`${HEALTH_ID_URL}/api/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
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
   * Fetch user profile from provider.id.th
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
   * Save session data to localStorage
   */
  saveSession: (profile: any) => {
    localStorage.setItem('provider_session', JSON.stringify(profile));
  },

  /**
   * Get current session
   */
  getSession: () => {
    const session = localStorage.getItem('provider_session');
    return session ? JSON.parse(session) : null;
  },

  /**
   * Clear session
   */
  logout: () => {
    localStorage.removeItem('provider_session');
    window.location.href = '/login';
  }
};
