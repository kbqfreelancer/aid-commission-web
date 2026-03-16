'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIndicatorsAction,
  getOrganisationsAction,
  createOrganisationAction,
  updateOrganisationAction,
  deactivateOrganisationAction,
  getReportsAction,
  getReportByIdAction,
  createReportAction,
  updateReportAction,
  updateReportStatusAction,
  deleteReportAction,
  getOrgSummaryAction,
  getNationalSummaryAction,
  getAdminConfigAction,
  getAdminConfigKeyAction,
  updateAdminConfigKeyAction,
  getAdminIndicatorsAction,
  createAdminIndicatorAction,
  getAdminAuditLogsAction,
} from '@/lib/actions';
import type {
  Organisation,
  OrganisationQueryParams,
  IndicatorQueryParams,
  ReportQueryParams,
  AuditLogQueryParams,
  AdminConfigKey,
} from '@/types';
import { toast } from 'sonner';

// ─── Indicators ───────────────────────────────────────────────────────────────
export const useIndicators = (params?: IndicatorQueryParams) =>
  useQuery({
    queryKey: ['indicators', params],
    queryFn:  async () => {
      const res = await getIndicatorsAction(params);
      return res.data ?? [];
    },
    staleTime: Infinity, // registry never changes at runtime
  });

// ─── Organisations ────────────────────────────────────────────────────────────
export const useOrganisations = (params?: OrganisationQueryParams) =>
  useQuery({
    queryKey: ['organisations', params],
    queryFn:  async () => {
      const res = await getOrganisationsAction(params);
      return res.data ?? [];
    },
  });

export const useCreateOrg = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Organisation>) => createOrganisationAction(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Organisation created'); },
    onError:   () => toast.error('Failed to create organisation'),
  });
};

export const useUpdateOrg = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Organisation> }) => updateOrganisationAction(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Organisation updated'); },
    onError:   () => toast.error('Failed to update organisation'),
  });
};

export const useDeactivateOrg = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateOrganisationAction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Organisation deactivated'); },
    onError:   () => toast.error('Failed to deactivate organisation'),
  });
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const useReports = (params?: ReportQueryParams) =>
  useQuery({
    queryKey: ['reports', params],
    queryFn:  async () => {
      const res = await getReportsAction(params);
      return { reports: res.data ?? [], meta: res.meta };
    },
  });

export const useReport = (id: string) =>
  useQuery({
    queryKey: ['reports', id],
    queryFn:  async () => {
      const res = await getReportByIdAction(id);
      return res.data ?? undefined;
    },
    enabled: !!id,
  });

export const useCreateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createReportAction(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report saved as draft'); },
    onError:   () => toast.error('Failed to save report'),
  });
};

export const useUpdateReport = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => updateReportAction(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports', id] }); toast.success('Report updated'); },
    onError:   () => toast.error('Failed to update report'),
  });
};

export const useUpdateStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
      updateReportStatusAction(id, status, notes),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      toast.success(`Report ${status}`);
    },
    onError: () => toast.error('Status update failed'),
  });
};

export const useDeleteReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReportAction(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report deleted'); },
    onError:   () => toast.error('Failed to delete report'),
  });
};

// ─── Summaries ────────────────────────────────────────────────────────────────
export const useOrgSummary = (
  year: number,
  quarter?: string,
  organisation?: string,
  page?: number,
  limit?: number
) =>
  useQuery({
    queryKey: ['summary', 'org', year, quarter, organisation, page, limit],
    queryFn:  async () => {
      const res = await getOrgSummaryAction({ year, quarter, organisation, page, limit });
      return res.data ?? [];
    },
    enabled: !!year,
  });

export const useNationalSummary = (year: number, quarter?: string) =>
  useQuery({
    queryKey: ['summary', 'national', year, quarter],
    queryFn:  async () => {
      const res = await getNationalSummaryAction({ year, quarter });
      return res.data ?? undefined;
    },
    enabled: !!year,
  });

// ─── Admin (guard by admin role in consuming components) ────────────────────
export const useAdminConfig = () =>
  useQuery({
    queryKey: ['admin', 'config'],
    queryFn:  async () => {
      const res = await getAdminConfigAction();
      return res.data ?? {};
    },
  });

export const useAdminConfigKey = (key: string) =>
  useQuery({
    queryKey: ['admin', 'config', key],
    queryFn:  async () => {
      const res = await getAdminConfigKeyAction(key);
      return res.data;
    },
    enabled: !!key,
  });

export const useUpdateAdminConfigKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: AdminConfigKey; value: unknown }) =>
      updateAdminConfigKeyAction(key, value),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'config'] });
      qc.invalidateQueries({ queryKey: ['admin', 'config', key] });
      toast.success('Config updated');
    },
    onError: () => toast.error('Failed to update config'),
  });
};

export const useAdminIndicators = (params?: IndicatorQueryParams) =>
  useQuery({
    queryKey: ['admin', 'indicators', params],
    queryFn:  async () => {
      const res = await getAdminIndicatorsAction(params);
      return { indicators: res.data ?? [], meta: res.meta };
    },
  });

export const useCreateAdminIndicator = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; number: string; label: string; breakdowns: unknown[] }) =>
      createAdminIndicatorAction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'indicators'] });
      qc.invalidateQueries({ queryKey: ['indicators'] });
      toast.success('Indicator created');
    },
    onError: () => toast.error('Failed to create indicator'),
  });
};

export const useAdminAuditLogs = (params?: AuditLogQueryParams) =>
  useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn:  async () => {
      const res = await getAdminAuditLogsAction(params);
      return { logs: res.data ?? [], meta: res.meta };
    },
  });
