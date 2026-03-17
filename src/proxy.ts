import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_ACCESS = 'pud_access_token';

const PROTECTED_PATHS = ['/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(COOKIE_ACCESS)?.value;
  if (token) return NextResponse.next();

  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
