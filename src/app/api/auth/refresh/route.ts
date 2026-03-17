import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/config/api';
import { cookieNames } from '@/lib/api-server';
import type { ApiResponse, AuthResponse, User } from '@/types';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function doRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
  user: User;
} | null> {
  const c = await cookies();
  const refreshToken = c.get(cookieNames.refresh)?.value;
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = (await res.json()) as ApiResponse<AuthResponse>;
  if (!res.ok || !json.data) return null;
  return json.data;
}

/** GET: Used when redirecting from serverFetch after 401. Reads cookies, refreshes, sets new cookies, redirects back. */
export async function GET(request: NextRequest) {
  const attempt = Number(request.nextUrl.searchParams.get('attempt') ?? '1');
  const redirectTo =
    request.nextUrl.searchParams.get('redirect') ||
    request.headers.get('referer')?.replace(/^https?:\/\/[^/]+/, '') ||
    '/dashboard';
  const cleanRedirect =
    redirectTo.startsWith('/') && !redirectTo.startsWith('/api/auth/refresh')
      ? redirectTo
      : '/dashboard';

  if (!Number.isFinite(attempt) || attempt > 1) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete(cookieNames.access);
    response.cookies.delete(cookieNames.refresh);
    return response;
  }

  const result = await doRefresh();
  if (!result) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete(cookieNames.access);
    response.cookies.delete(cookieNames.refresh);
    return response;
  }

  const response = NextResponse.redirect(new URL(cleanRedirect, request.url));
  response.cookies.set(cookieNames.access, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  response.cookies.set(cookieNames.refresh, result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
  return response;
}

export async function POST() {
  try {
    const c = await cookies();
    const refreshToken = c.get(cookieNames.refresh)?.value;
    if (!refreshToken) {
      const response = NextResponse.json(
        { success: false, message: 'No refresh token' },
        { status: 401 }
      );
      response.cookies.delete(cookieNames.access);
      response.cookies.delete(cookieNames.refresh);
      return response;
    }

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = (await res.json()) as ApiResponse<AuthResponse>;
    if (!res.ok) {
      const response = NextResponse.json(json, { status: res.status });
      response.cookies.delete(cookieNames.access);
      response.cookies.delete(cookieNames.refresh);
      return response;
    }

    const { user, accessToken: newAccessToken, refreshToken: newRefreshToken } = json.data!;
    const response = NextResponse.json({
      success: true,
      data: { user, accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
    response.cookies.set(cookieNames.access, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    response.cookies.set(cookieNames.refresh, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    return response;
  } catch (err) {
    const response = NextResponse.json(
      { success: false, message: 'Refresh failed' },
      { status: 500 }
    );
    response.cookies.delete(cookieNames.access);
    response.cookies.delete(cookieNames.refresh);
    return response;
  }
}
