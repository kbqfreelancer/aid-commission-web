/**
 * Server-side API client. Uses cookies() for auth. No localStorage.
 * Use only in Server Components, Server Actions, Route Handlers.
 */
import { cookies } from 'next/headers';
import { cache } from 'react';
import { API_BASE } from '@/config/api';
import type { ApiResponse, User } from '@/types';

const COOKIE_ACCESS = 'pud_access_token';
const COOKIE_REFRESH = 'pud_refresh_token';

async function getAccessToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_ACCESS)?.value ?? null;
}

export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string | null
): Promise<ApiResponse<T>> {
  const token = tokenOverride ?? (await getAccessToken());
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error((json as ApiResponse<unknown>).message ?? 'Request failed');
  }
  return json as ApiResponse<T>;
}

export const getSession = cache(async (): Promise<{ user: User; accessToken: string } | null> => {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await serverFetch<User>('/auth/me', undefined, token);
    const user = res.data;
    if (!user) return null;
    return { user, accessToken: token };
  } catch {
    return null;
  }
});

export const cookieNames = { access: COOKIE_ACCESS, refresh: COOKIE_REFRESH } as const;
