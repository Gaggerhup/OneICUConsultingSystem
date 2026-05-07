'use server';

import { resolveServerHealthRedirectUri } from '@/lib/server-oauth-urls';
import { serverAuthEnv } from '@/lib/server-auth-env';
import { createProviderSession } from '@/lib/server-sessions';

const HEALTH_ID_URL = serverAuthEnv.healthBaseUrl() || 'https://uat-moph.id.th';
const PROVIDER_ID_URL = serverAuthEnv.providerBaseUrl() || 'https://uat-provider.id.th';

const OAUTH_CLIENT_ID = serverAuthEnv.healthClientId();
const REDIRECT_URI = serverAuthEnv.healthRedirectUri();
const OAUTH_CLIENT_SECRET = serverAuthEnv.healthClientSecret();
const PROVIDER_CLIENT_ID = serverAuthEnv.providerClientId();
const PROVIDER_CLIENT_SECRET = serverAuthEnv.providerClientSecret();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const pickErrorMessage = (payload: any, fallback: string) => {
  const candidates = [
    payload?.error_description,
    payload?.error,
    payload?.message,
    payload?.data?.message,
    payload?.data?.error,
    payload?.data?.error_description,
    payload?.errors?.[0]?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }

  return fallback;
};

const describeFetchFailure = (error: any, label: string, url: string) => {
  const code = error?.cause?.code || error?.code || '';
  const reason = code ? `${error?.message || 'fetch failed'} (${code})` : error?.message || 'fetch failed';

  if (
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    error?.message === 'fetch failed'
  ) {
    return `${label} connection failed: cannot reach ${url}. ${reason}`;
  }

  return `${label} request failed: ${reason}`;
};

const fetchWithRetry = async (url: string, init: RequestInit, label: string) => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;
      console.error(`[OAuth ${label} fetch attempt ${attempt} failed]:`, error);
      if (attempt < 2) await wait(750);
    }
  }

  throw new Error(describeFetchFailure(lastError, label, url));
};

export async function authenticateWithCode(code: string, redirectUri?: string) {
  try {
    const resolvedRedirectUri = redirectUri || REDIRECT_URI || resolveServerHealthRedirectUri();

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
    
    const tokenData = await readJson(tokenResponse);
    if (!tokenResponse.ok || tokenData?.error || !tokenData?.data?.access_token) {
      console.error('[OAuth Health ID token response]:', {
        status: tokenResponse.status,
        payload: tokenData,
      });
      throw new Error(
        `Health ID token exchange failed (${tokenResponse.status}): ${pickErrorMessage(tokenData, 'Failed to exchange Health ID token')}`,
      );
    }

    // 2. Get Provider ID Access Token using Health ID token
    const providerTokenResponse = await fetchWithRetry(`${PROVIDER_ID_URL}/api/v1/services/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PROVIDER_CLIENT_ID,
        secret_key: PROVIDER_CLIENT_SECRET,
        token_by: 'Health ID',
        token: tokenData.data.access_token,
      }),
    }, 'Provider token');
    
    const providerTokenData = await readJson(providerTokenResponse);
    if (!providerTokenResponse.ok || providerTokenData?.error || !providerTokenData?.data?.access_token) {
      console.error('[OAuth Provider ID token response]:', {
        status: providerTokenResponse.status,
        payload: providerTokenData,
      });
      throw new Error(
        `Provider ID token exchange failed (${providerTokenResponse.status}): ${pickErrorMessage(providerTokenData, 'Failed to get Provider ID token')}`,
      );
    }

    // 3. Fetch user profile from provider.id.th
    const profileResponse = await fetchWithRetry(`${PROVIDER_ID_URL}/api/v1/services/profile?position_type=1`, {
      method: 'GET',
      headers: {
        'client-id': PROVIDER_CLIENT_ID,
        'secret-key': PROVIDER_CLIENT_SECRET,
        'Authorization': `Bearer ${providerTokenData.data.access_token}`,
      },
    }, 'Provider profile');
    
    const profileData = await readJson(profileResponse);
    if (!profileResponse.ok || profileData?.error || !profileData?.data) {
      console.error('[OAuth Provider ID profile response]:', {
        status: profileResponse.status,
        payload: profileData,
      });
      throw new Error(
        `Provider ID profile failed (${profileResponse.status}): ${pickErrorMessage(profileData, 'Failed to fetch provider profile')}`,
      );
    }

    let serverSessionCreated = false;
    let serverSession: Awaited<ReturnType<typeof createProviderSession>> | null = null;
    try {
      serverSession = await createProviderSession({
        profile: profileData.data,
      });
      serverSessionCreated = true;
    } catch (sessionError) {
      console.error('[OAuth Session Warning]:', sessionError);
    }

    return { success: true, profile: profileData.data, serverSessionCreated, serverSession };
  } catch (error: any) {
    console.error('[OAuth Server Action Error]:', error);
    return { success: false, error: error.message || 'Server authentication failed' };
  }
}
