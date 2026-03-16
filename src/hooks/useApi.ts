'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { indicatorApi, orgApi, reportApi } from '@/lib/api';
import { toast } from 'sonner';

// ─── Indicators ───────────────────────────────────────────────────────────────
export const useIndicators = () =>
  useQuery({
    queryKey: ['indicators'],
    queryFn:  async () => {
      const res = await indicatorApi.list();
      return res.data.data ?? [];
    },
    staleTime: Infinity, // registry never changes at runtime
  });

// ─── Organisations ────────────────────────────────────────────────────────────
export const useOrganisations = () =>
  useQuery({
    queryKey: ['organisations'],
    queryFn:  async () => {
      const res = await orgApi.list();
      return res.data.data ?? [];
    },
  });

export const useCreateOrg = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof orgApi.create>[0]) => orgApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Organisation created'); },
    onError:   () => toast.error('Failed to create organisation'),
  });
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const useReports = (params?: Record<string, string | number>) =>
  useQuery({
    queryKey: ['reports', params],
    queryFn:  async () => {
      const res = await reportApi.list(params);
      return { reports: res.data.data ?? [], meta: res.data.meta };
    },
  });

export const useReport = (id: string) =>
  useQuery({
    queryKey: ['reports', id],
    queryFn:  async () => {
      const res = await reportApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });

export const useCreateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => reportApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report saved as draft'); },
    onError:   () => toast.error('Failed to save report'),
  });
};

export const useUpdateReport = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => reportApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports', id] }); toast.success('Report updated'); },
    onError:   () => toast.error('Failed to update report'),
  });
};

export const useUpdateStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
      reportApi.updateStatus(id, status, notes),
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
    mutationFn: (id: string) => reportApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report deleted'); },
    onError:   () => toast.error('Failed to delete report'),
  });
};

// ─── Summaries ────────────────────────────────────────────────────────────────
export const useOrgSummary = (year: number, quarter?: string) =>
  useQuery({
    queryKey: ['summary', 'org', year, quarter],
    queryFn:  async () => {
      const res = await reportApi.summaryByOrg({ year, quarter });
      return res.data.data ?? [];
    },
    enabled: !!year,
  });

export const useNationalSummary = (year: number, quarter?: string) =>
  useQuery({
    queryKey: ['summary', 'national', year, quarter],
    queryFn:  async () => {
      const res = await reportApi.nationalSummary({ year, quarter });
      return res.data.data;
    },
    enabled: !!year,
  });
