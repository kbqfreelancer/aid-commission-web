/**
 * config/api.ts
 * API base URL for server-side fetch (api-server, auth routes).
 * Set NEXT_PUBLIC_API_BASE in .env.local or .env
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'https://aid-commission-backend-api.onrender.com/api/v1';
