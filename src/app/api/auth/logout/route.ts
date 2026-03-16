import { NextResponse } from 'next/server';
import { cookieNames } from '@/lib/api-server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(cookieNames.access);
  response.cookies.delete(cookieNames.refresh);
  return response;
}
