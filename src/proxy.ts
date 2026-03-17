import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_ACCESS = 'pud_access_token';
const COOKIE_REFRESH = 'pud_refresh_token';

const PROTECTED_PATHS = ['/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected =
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtected) return NextResponse.next();

  const accessToken = request.cookies.get(COOKIE_ACCESS)?.value;
  if (accessToken) return NextResponse.next();

  const refreshToken = request.cookies.get(COOKIE_REFRESH)?.value;
  if (refreshToken) {
    const refreshUrl = new URL('/api/auth/refresh', request.url);
    refreshUrl.searchParams.set('redirect', `${pathname}${search}`);
    refreshUrl.searchParams.set('attempt', '1');
    return NextResponse.redirect(refreshUrl);
  }

  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
