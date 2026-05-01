'use server';

import { resolvePublicAppUrl } from '@/lib/public-url';
import { serverAuthEnv } from '@/lib/server-auth-env';

const HEALTH_ID_URL = serverAuthEnv.healthBaseUrl() || 'https://uat-moph.id.th';
const PROVIDER_ID_URL = serverAuthEnv.providerBaseUrl() || 'https://uat-provider.id.th';

const OAUTH_CLIENT_ID = serverAuthEnv.healthClientId();
const REDIRECT_URI = serverAuthEnv.healthRedirectUri();
const OAUTH_CLIENT_SECRET = serverAuthEnv.healthClientSecret();
const PROVIDER_CLIENT_ID = serverAuthEnv.providerClientId();
const PROVIDER_CLIENT_SECRET = serverAuthEnv.providerClientSecret();

export async function authenticateWithCode(code: string, redirectUri?: string) {
  try {
    const resolvedRedirectUri = redirectUri || REDIRECT_URI || `${resolvePublicAppUrl()}/api/auth/healthid`;

    if (!resolvedRedirectUri) {
      throw new Error('Missing redirect URI for Provider ID authentication');
    }

    // 1. Exchange authorization code for Health ID access token
    const tokenResponse = await fetch(`${HEALTH_ID_URL}/api/v1/token`, {
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
    
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(tokenData.error || 'Failed to exchange Health ID token');
    }

    // 2. Get Provider ID Access Token using Health ID token
    const providerTokenResponse = await fetch(`${PROVIDER_ID_URL}/api/v1/services/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PROVIDER_CLIENT_ID,
        secret_key: PROVIDER_CLIENT_SECRET,
        token_by: 'Health ID',
        token: tokenData.data.access_token,
      }),
    });
    
    const providerTokenData = await providerTokenResponse.json();
    if (!providerTokenResponse.ok || providerTokenData.error) {
      throw new Error(providerTokenData.error || 'Failed to get Provider ID token');
    }

    // 3. Fetch user profile from provider.id.th
    const profileResponse = await fetch(`${PROVIDER_ID_URL}/api/v1/services/profile?position_type=1`, {
      method: 'GET',
      headers: {
        'client-id': PROVIDER_CLIENT_ID,
        'secret-key': PROVIDER_CLIENT_SECRET,
        'Authorization': `Bearer ${providerTokenData.data.access_token}`,
      },
    });
    
    const profileData = await profileResponse.json();
    if (!profileResponse.ok || profileData.error) {
      throw new Error(profileData.error || 'Failed to fetch provider profile');
    }

    return { success: true, profile: profileData.data };
  } catch (error: any) {
    console.error('[OAuth Server Action Error]:', error);
    return { success: false, error: error.message || 'Server authentication failed' };
  }
}
