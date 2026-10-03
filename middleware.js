import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'goynar-baksho-annual-2026-super-secure-jwt-secret-key-32b';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'gb_admin_session';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  let session = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secretKey);
      session = payload;
    } catch {
      // Invalid or expired token
      session = null;
    }
  }

  const isLoginPage = pathname === '/admin/login';

  // If visiting login page while already authenticated, redirect to dashboard
  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // All other /admin routes require valid authentication
  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, attach user info to headers for downstream access if needed
  const response = NextResponse.next();
  response.headers.set('x-user-role', session.role);
  response.headers.set('x-user-id', session.userId);
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
