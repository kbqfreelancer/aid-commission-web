import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE } from '@/config/api';
import { cookieNames } from '@/lib/api-server';

export async function POST() {
  const c = await cookies();
  const accessToken = c.get(cookieNames.access)?.value;

  if (accessToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });
    } catch {
      // Proceed with local cookie cleanup even if backend logout fails.
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(cookieNames.access);
  response.cookies.delete(cookieNames.refresh);
  return response;
}
