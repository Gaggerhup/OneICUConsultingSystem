import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for Robust Route Protection
 * 
 * This middleware intercepts all requests to the application.
 * It checks for the 'auth_session' cookie which is set by the authService
 * on successful Provider ID login.
 * 
 * If the cookie is missing and the user is trying to access a protected route,
 * they are redirected to the login page immediately.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authSession = request.cookies.get('auth_session');

  // 1. Define Public Routes (Always accessible)
  const isPublicRoute = 
    pathname === '/login' || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/public') ||
    pathname.includes('.') || // Static files like favicon.ico, images, etc.
    pathname === '/';

  // 2. Redirect to login if accessing protected route without session
  if (!authSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Optional: add a redirect parameter to return to the original page after login
    // loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Optional: Redirect to dashboard if logged in and trying to access /login
  if (authSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
