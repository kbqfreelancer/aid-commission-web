import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/config/api';
import { cookieNames } from '@/lib/api-server';
import type { ApiResponse, AuthResponse } from '@/types';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as ApiResponse<AuthResponse>;
    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    const { user, accessToken, refreshToken } = json.data!;
    const response = NextResponse.json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
    response.cookies.set(cookieNames.access, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    response.cookies.set(cookieNames.refresh, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });
    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
