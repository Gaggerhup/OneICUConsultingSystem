'use server';

const HEALTH_ID_URL = process.env.NEXT_PUBLIC_HEALTH_BASE_URL || 'https://uat-moph.id.th';
const PROVIDER_ID_URL = process.env.NEXT_PUBLIC_PROVIDER_BASE_URL || 'https://uat-provider.id.th';

const CLIENT_ID = process.env.NEXT_PUBLIC_HEALTH_CLIENT_ID || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_HEALTH_REDIRECT_URI || '';
const HEALTH_CLIENT_SECRET = process.env.NEXT_PUBLIC_HEALTH_CLIENT_SECRET || '';
const PROVIDER_CLIENT_ID = process.env.NEXT_PUBLIC_PROVIDER_CLIENT_ID || '';
const PROVIDER_CLIENT_SECRET = process.env.NEXT_PUBLIC_PROVIDER_CLIENT_SECRET || '';

export async function authenticateWithCode(code: string, redirectUri?: string) {
  try {
    const resolvedRedirectUri = redirectUri || REDIRECT_URI;

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
        client_id: CLIENT_ID,
        client_secret: HEALTH_CLIENT_SECRET
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
