import { apiClient } from '@/config/api';
import type {
  ApiResponse, AuthResponse, User, Organisation, IndicatorDefinition,
  HrReport, OrgSummaryRow, NationalSummary, LoginForm, RegisterForm,
} from '@/types';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:   (data: LoginForm)    => apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register:(data: RegisterForm) => apiClient.post<ApiResponse<User>>('/auth/register', data),
  me:      ()                   => apiClient.get<ApiResponse<User>>('/auth/me'),
  refresh: (token: string)      => apiClient.post<ApiResponse<{accessToken:string}>>('/auth/refresh', { token }),
};

// ─── Indicators ───────────────────────────────────────────────────────────────
export const indicatorApi = {
  list:    () => apiClient.get<ApiResponse<IndicatorDefinition[]>>('/indicators'),
  getById: (id: string) => apiClient.get<ApiResponse<IndicatorDefinition>>(`/indicators/${id}`),
};

// ─── Organisations ────────────────────────────────────────────────────────────
export const orgApi = {
  list:       () => apiClient.get<ApiResponse<Organisation[]>>('/organisations'),
  getById:    (id: string) => apiClient.get<ApiResponse<Organisation>>(`/organisations/${id}`),
  create:     (data: Partial<Organisation>) => apiClient.post<ApiResponse<Organisation>>('/organisations', data),
  update:     (id: string, data: Partial<Organisation>) => apiClient.patch<ApiResponse<Organisation>>(`/organisations/${id}`, data),
  deactivate: (id: string) => apiClient.delete<ApiResponse<void>>(`/organisations/${id}`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportApi = {
  list: (params?: Record<string, string | number>) =>
    apiClient.get<ApiResponse<HrReport[]>>('/reports', { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<HrReport>>(`/reports/${id}`),
  create: (data: unknown) =>
    apiClient.post<ApiResponse<HrReport>>('/reports', data),
  update: (id: string, data: unknown) =>
    apiClient.patch<ApiResponse<HrReport>>(`/reports/${id}`, data),
  updateStatus: (id: string, status: string, notes?: string) =>
    apiClient.patch<ApiResponse<HrReport>>(`/reports/${id}/status`, { status, notes }),
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/reports/${id}`),
  summaryByOrg: (params: { year: number; quarter?: string; organisation?: string }) =>
    apiClient.get<ApiResponse<OrgSummaryRow[]>>('/reports/summary/by-organisation', { params }),
  nationalSummary: (params: { year: number; quarter?: string }) =>
    apiClient.get<ApiResponse<NationalSummary>>('/reports/summary/national', { params }),
};
