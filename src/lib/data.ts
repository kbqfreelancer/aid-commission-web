/**
 * Server-side data fetchers with React.cache() for per-request deduplication.
 * Use only in Server Components.
 */
import { cache } from 'react';
import { serverFetch } from '@/lib/api-server';
import type {
  Organisation,
  IndicatorDefinition,
  HrReport,
  OrgSummaryRow,
  NationalSummary,
} from '@/types';

const qs = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return entries.length ? '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString() : '';
};

export const getIndicators = cache(async (): Promise<IndicatorDefinition[]> => {
  const res = await serverFetch<IndicatorDefinition[]>('/indicators');
  return res.data ?? [];
});

export const getOrganisations = cache(async (): Promise<Organisation[]> => {
  const res = await serverFetch<Organisation[]>('/organisations');
  return res.data ?? [];
});

export const getReport = cache(async (id: string) => {
  const res = await serverFetch<HrReport>(`/reports/${id}`);
  return res.data ?? null;
});

interface ReportsResult {
  reports: HrReport[];
  meta?: { total: number; page: number; limit: number; pages: number };
}

export const getReports = cache(
  async (
    year: number,
    limit: number,
    quarter?: string,
    organisation?: string,
    status?: string,
    page?: number
  ): Promise<ReportsResult> => {
    const params: Record<string, string | number | undefined> = {
      year,
      limit,
      quarter: quarter || undefined,
      organisation: organisation || undefined,
      status: status || undefined,
      page: page || undefined,
    };
    const res = await serverFetch<HrReport[]>(`/reports${qs(params)}`);
    return {
      reports: res.data ?? [],
      meta: res.meta,
    };
  }
);

export const getNationalSummary = cache(async (year: number, quarter?: string) => {
  const res = await serverFetch<NationalSummary>(
    `/reports/summary/national${qs({ year, quarter })}`
  );
  return res.data ?? null;
});

export const getOrgSummary = cache(async (year: number, quarter?: string, organisation?: string) => {
  const res = await serverFetch<OrgSummaryRow[]>(
    `/reports/summary/by-organisation${qs({ year, quarter, organisation })}`
  );
  return res.data ?? [];
});
