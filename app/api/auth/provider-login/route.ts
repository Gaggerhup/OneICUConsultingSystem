import { NextResponse } from 'next/server';

const HEALTH_ID_URL = 'https://moph.id.th';
const CALLBACK_PATH = '/api/auth/healthid';

export function GET(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_HEALTH_CLIENT_ID || '';
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}${CALLBACK_PATH}`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Missing NEXT_PUBLIC_HEALTH_CLIENT_ID on the server' },
      { status: 500 }
    );
  }

  const url = new URL('/oauth/redirect', HEALTH_ID_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  }).toString();

  return NextResponse.redirect(url);
}
