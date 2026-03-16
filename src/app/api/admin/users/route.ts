import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/config/api';
import { cookieNames } from '@/lib/api-server';
import type { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const c = await cookies();
    const token = c.get(cookieNames.access)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as ApiResponse<User>;
    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }
    return NextResponse.json({ success: true, data: json.data });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
