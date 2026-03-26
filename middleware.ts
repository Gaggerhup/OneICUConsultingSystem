import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get provider_session from cookies
  const providerSession = request.cookies.get('provider_session');
  const authSession = request.cookies.get('auth_session');

  // Define public routes
  const isPublicRoute = pathname === '/login' || pathname === '/auth-callback' || pathname.startsWith('/_next') || pathname.startsWith('/api');

  // If not logged in and trying to access private route, redirect to login
  if (!providerSession && !authSession && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If already logged in and visiting login page, redirect to dashboard
  if ((providerSession || authSession) && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/active-cases';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config to match all routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
