'use server';

import { serverFetch } from '@/lib/api-server';
import type {
  Organisation,
  IndicatorDefinition,
  HrReport,
  OrgSummaryRow,
  NationalSummary,
  ApiResponse,
  OrganisationQueryParams,
  IndicatorQueryParams,
  ReportQueryParams,
  SummaryByOrgQueryParams,
  SummaryQueryParams,
  AuditLogQueryParams,
  AdminConfigKey,
  User,
} from '@/types';

const qs = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return entries.length ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : '';
};

// ─── Indicators ───────────────────────────────────────────────────────────────
export async function getIndicatorsAction(
  params?: IndicatorQueryParams
): Promise<ApiResponse<IndicatorDefinition[]>> {
  const q = params ? qs(params as Record<string, string | number | undefined>) : '';
  const res = await serverFetch<IndicatorDefinition[]>(`/indicators${q}`);
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function getIndicatorByIdAction(id: string): Promise<ApiResponse<IndicatorDefinition | null>> {
  const res = await serverFetch<IndicatorDefinition>(`/indicators/${id}`);
  return { success: true, data: res.data ?? null };
}

// ─── Organisations ────────────────────────────────────────────────────────────
export async function getOrganisationsAction(
  params?: OrganisationQueryParams
): Promise<ApiResponse<Organisation[]>> {
  const q = params ? qs(params as Record<string, string | number | undefined>) : '';
  const res = await serverFetch<Organisation[]>(`/organisations${q}`);
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function getOrganisationByIdAction(id: string): Promise<ApiResponse<Organisation | null>> {
  const res = await serverFetch<Organisation>(`/organisations/${id}`);
  return { success: true, data: res.data ?? null };
}

export async function createOrganisationAction(data: Partial<Organisation>): Promise<ApiResponse<Organisation>> {
  const res = await serverFetch<Organisation>('/organisations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function updateOrganisationAction(
  id: string,
  data: Partial<Organisation>
): Promise<ApiResponse<Organisation>> {
  const res = await serverFetch<Organisation>(`/organisations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res;
}

export async function deactivateOrganisationAction(id: string): Promise<ApiResponse<void>> {
  const res = await serverFetch<void>(`/organisations/${id}`, {
    method: 'DELETE',
  });
  return res;
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export async function getReportsAction(
  params?: ReportQueryParams
): Promise<ApiResponse<HrReport[]>> {
  const q = params ? qs(params as Record<string, string | number | undefined>) : '';
  const res = await serverFetch<HrReport[]>(`/reports${q}`);
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function getReportByIdAction(id: string): Promise<ApiResponse<HrReport | null>> {
  const res = await serverFetch<HrReport>(`/reports/${id}`);
  return { success: true, data: res.data ?? null };
}

export async function createReportAction(data: unknown): Promise<ApiResponse<HrReport>> {
  const res = await serverFetch<HrReport>('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function updateReportAction(id: string, data: unknown): Promise<ApiResponse<HrReport>> {
  const res = await serverFetch<HrReport>(`/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res;
}

export async function updateReportStatusAction(
  id: string,
  status: string,
  notes?: string
): Promise<ApiResponse<HrReport>> {
  const res = await serverFetch<HrReport>(`/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  });
  return res;
}

export async function deleteReportAction(id: string): Promise<ApiResponse<void>> {
  const res = await serverFetch<void>(`/reports/${id}`, {
    method: 'DELETE',
  });
  return res;
}

// ─── Summaries ────────────────────────────────────────────────────────────────
export async function getOrgSummaryAction(
  params: SummaryByOrgQueryParams
): Promise<ApiResponse<OrgSummaryRow[]>> {
  const res = await serverFetch<OrgSummaryRow[]>(
    `/reports/summary/by-organisation${qs(params as unknown as Record<string, string | number | undefined>)}`
  );
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function getNationalSummaryAction(
  params: SummaryQueryParams
): Promise<ApiResponse<NationalSummary | null>> {
  const res = await serverFetch<NationalSummary>(
    `/reports/summary/national${qs(params as unknown as Record<string, string | number | undefined>)}`
  );
  return { success: true, data: res.data ?? null };
}

// ─── Admin API ───────────────────────────────────────────────────────────────
export async function getAdminConfigAction(): Promise<ApiResponse<Record<string, unknown>>> {
  const res = await serverFetch<Record<string, unknown>>('/admin/config');
  return { success: true, data: res.data ?? {} };
}

export async function getAdminConfigKeyAction(key: string): Promise<ApiResponse<unknown>> {
  const res = await serverFetch<unknown>(`/admin/config/${encodeURIComponent(key)}`);
  return { success: true, data: res.data };
}

export async function updateAdminConfigKeyAction(
  key: AdminConfigKey,
  value: unknown
): Promise<ApiResponse<unknown>> {
  const res = await serverFetch<unknown>(`/admin/config/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify(value),
  });
  return res;
}

export async function getAdminIndicatorsAction(
  params?: IndicatorQueryParams
): Promise<ApiResponse<IndicatorDefinition[]>> {
  const q = params ? qs(params as Record<string, string | number | undefined>) : '';
  const res = await serverFetch<IndicatorDefinition[]>(`/admin/config/indicators${q}`);
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function createAdminIndicatorAction(data: {
  id: string;
  number: string;
  label: string;
  breakdowns: unknown[];
}): Promise<ApiResponse<IndicatorDefinition>> {
  const res = await serverFetch<IndicatorDefinition>('/admin/config/indicators', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}

export async function getAdminAuditLogsAction(
  params?: AuditLogQueryParams
): Promise<ApiResponse<unknown[]>> {
  const q = params ? qs(params as Record<string, string | number | undefined>) : '';
  const res = await serverFetch<unknown[]>(`/admin/audit-logs${q}`);
  return { success: true, data: res.data ?? [], meta: res.meta };
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  organisation?: string;
}): Promise<ApiResponse<User>> {
  const res = await serverFetch<User>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res;
}
