import { NextResponse } from 'next/server';
import { serverAuthEnv } from '@/lib/server-auth-env';
import { resolvePublicAppUrl } from '@/lib/public-url';

const HEALTH_ID_URL = serverAuthEnv.healthBaseUrl() || 'https://uat-moph.id.th';
const CALLBACK_PATH = '/api/auth/healthid';

export function GET() {
  const clientId = serverAuthEnv.healthClientId();
  const origin = resolvePublicAppUrl();
  const redirectUri = `${origin}${CALLBACK_PATH}`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing HEALTH_CLIENT_ID / NEXT_PUBLIC_HEALTH_CLIENT_ID on the server' },
      { status: 500 }
    );
  }

  const url = new URL('/oauth/redirect', HEALTH_ID_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    landing: '/dashboard',
    is_auth: 'yes',
  }).toString();

  return NextResponse.redirect(url);
}
