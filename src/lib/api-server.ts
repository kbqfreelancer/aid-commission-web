/**
 * Server-side API client. Uses cookies() for auth. No localStorage.
 * Use only in Server Components, Server Actions, Route Handlers.
 */
import { cookies, headers } from 'next/headers';
import { redirect, unstable_rethrow } from 'next/navigation';
import { cache } from 'react';
import { API_BASE } from '@/config/api';
import type { ApiResponse, AuthResponse, User } from '@/types';

const COOKIE_ACCESS = 'pud_access_token';
const COOKIE_REFRESH = 'pud_refresh_token';

async function getAccessToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_ACCESS)?.value ?? null;
}

async function getRefreshToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE_REFRESH)?.value ?? null;
}

/** Call backend refresh endpoint directly. Returns new tokens or null. Does not set cookies. */
export async function refreshAccessToken(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = (await res.json()) as ApiResponse<AuthResponse>;
    if (!res.ok || !json.data) return null;
    return {
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    };
  } catch {
    return null;
  }
}

async function getRedirectPath(): Promise<string> {
  try {
    const h = await headers();
    const url = h.get('x-url') ?? h.get('x-invoke-path') ?? h.get('referer');
    if (url) {
      try {
        const path = new URL(url).pathname;
        if (path.startsWith('/') && path !== '/api/auth/refresh') return path;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* headers() may throw in some contexts */
  }
  return '/dashboard';
}

const FETCH_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 3_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { headers: HeadersInit }
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function serverFetch<T>(
  path: string,
  init?: RequestInit,
  tokenOverride?: string | null,
  options?: { skipRefreshRedirect?: boolean }
): Promise<ApiResponse<T>> {
  const token = tokenOverride ?? (await getAccessToken());
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headersInit: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers ?? {}),
  };
  if (token) {
    (headersInit as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const doFetch = () =>
    fetchWithTimeout(url, {
      ...init,
      headers: headersInit,
      cache: 'no-store',
    });

  let res: Response;
  try {
    res = await doFetch();
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : String(err);
    const isConnectionError =
      /fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|network/i.test(msg) ||
      (err instanceof Error && err.name === 'AbortError');
    if (isConnectionError) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      try {
        res = await doFetch();
      } catch (retryErr) {
        throw new Error(
          'Unable to reach the API. The backend may be starting up—please try again in a moment.'
        );
      }
    } else {
      throw err;
    }
  }
  const json = (await res.json()) as ApiResponse<unknown>;
  if (!res.ok) {
    const message = (json as ApiResponse<unknown>).message ?? 'Request failed';
    const isAuthError =
      res.status === 401 &&
      typeof message === 'string' &&
      /invalid|expired|token|unauthorized/i.test(message);
    if (isAuthError && !options?.skipRefreshRedirect) {
      const hasRefresh = await getRefreshToken();
      if (hasRefresh) {
        redirect(
          `/api/auth/refresh?attempt=1&redirect=${encodeURIComponent(await getRedirectPath())}`
        );
      }
      redirect('/auth/login');
    }
    throw new Error(String(message));
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
  } catch (err) {
    unstable_rethrow(err);
    return null;
  }
});

export const cookieNames = { access: COOKIE_ACCESS, refresh: COOKIE_REFRESH } as const;
