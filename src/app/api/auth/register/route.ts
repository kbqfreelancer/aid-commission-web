import { NextRequest, NextResponse } from 'next/server';
import { API_BASE } from '@/config/api';
import { cookieNames } from '@/lib/api-server';
import type { ApiResponse, User } from '@/types';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as ApiResponse<User>;
    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    const user = json.data!;
    // Register returns user but no tokens – user must log in to get tokens.
    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
