import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithCode } from '@/actions/authActions';
import { resolveServerHealthRedirectUri } from '@/lib/server-oauth-urls';

const safeJsonForScript = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const htmlResponse = (html: string, status = 200, authCookie?: { value: string; expiresAt?: string }) => {
  const response = new NextResponse(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });

  if (authCookie?.value) {
    response.cookies.set('auth_session', authCookie.value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: authCookie.expiresAt ? new Date(authCookie.expiresAt) : undefined,
    });
  }

  return response;
};

const renderCallbackPage = (profile: Record<string, unknown>, authCookieValue: string) => {
  const profileJson = safeJsonForScript(profile);
  const cookieValueJson = safeJsonForScript(authCookieValue);
  const metaJson = safeJsonForScript({
    lastUsedAt: new Date().toISOString(),
    userAgent: '',
    platform: '',
  });

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Provider ID Login</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; }
    main { width: min(420px, calc(100vw - 32px)); padding: 28px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; box-shadow: 0 16px 40px rgba(15, 23, 42, .08); text-align: center; }
    h1 { margin: 0 0 8px; font-size: 22px; line-height: 1.25; }
    p { margin: 0; color: #475569; line-height: 1.6; }
  </style>
</head>
<body>
  <main>
    <h1>เข้าสู่ระบบสำเร็จ</h1>
    <p>กำลังพาไปหน้าแดชบอร์ด...</p>
  </main>
  <script>
    const profile = ${profileJson};
    const meta = ${metaJson};
    meta.userAgent = window.navigator.userAgent;
    meta.platform = window.navigator.platform;
    localStorage.setItem('provider_session', JSON.stringify(profile));
    localStorage.setItem('auth_session_meta', JSON.stringify(meta));
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = 'auth_session=' + encodeURIComponent(${cookieValueJson}) + '; path=/; expires=' + expires.toUTCString() + '; SameSite=Lax';
    window.location.replace('/dashboard');
  </script>
</body>
</html>`;
};

const renderErrorPage = (message: string) => `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Provider ID Login Failed</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; }
    main { width: min(460px, calc(100vw - 32px)); padding: 28px; border: 1px solid #fecaca; border-radius: 8px; background: #fff; box-shadow: 0 16px 40px rgba(15, 23, 42, .08); text-align: center; }
    h1 { margin: 0 0 8px; font-size: 22px; line-height: 1.25; color: #b91c1c; }
    p { margin: 0 0 20px; color: #475569; line-height: 1.6; word-break: break-word; }
    a { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 0 18px; border-radius: 8px; background: #16a34a; color: #fff; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <h1>ยืนยันตัวตนไม่สำเร็จ</h1>
    <p>${message.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char))}</p>
    <a href="/login">กลับไปหน้าเข้าสู่ระบบ</a>
  </main>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return htmlResponse(renderErrorPage('ไม่พบรหัสยืนยันจาก Provider ID'), 400);
  }

  const result = await authenticateWithCode(code, resolveServerHealthRedirectUri());
  if (!result.success || !result.profile) {
    return htmlResponse(renderErrorPage(result.error || 'ไม่สามารถยืนยันตัวตนกับ Provider ID ได้'), 400);
  }

  const authCookieValue = result.serverSession?.sessionId || 'true';
  return htmlResponse(
    renderCallbackPage(result.profile, authCookieValue),
    200,
    result.serverSession ? { value: result.serverSession.sessionId, expiresAt: result.serverSession.expiresAt } : undefined,
  );
}
