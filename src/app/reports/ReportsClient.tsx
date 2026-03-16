'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { ReportRow, ReportTableSkeleton } from '@/components/reports/ReportRow';
import type { HrReport, Organisation, User } from '@/types';

const STATUSES = ['draft', 'submitted', 'verified', 'rejected'] as const;
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export function ReportsClient({
  reports,
  orgs,
  meta,
  serverUser,
}: {
  reports: HrReport[];
  orgs: Organisation[];
  meta: { total: number; page: number; limit: number; pages: number } | undefined;
  serverUser: User;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const page = Number(searchParams.get('page') || '1');
  const orgId = searchParams.get('org') || '';
  const year = searchParams.get('year') || '';
  const quarter = searchParams.get('quarter') || '';
  const status = searchParams.get('status') || '';

  const filtered = search
    ? reports.filter((r) => {
        const org = (r.organisation as { name?: string })?.name?.toLowerCase() ?? '';
        return org.includes(search.toLowerCase());
      })
    : reports;

  const setFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.set('page', '1');
    router.push(`/reports?${params.toString()}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    router.push(`/reports?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push('/reports');
  };

  const hasFilters = orgId || year || quarter || status || search;

  return (
    <AppShell
      serverUser={serverUser}
      title="Reports"
      description="Manage and track HR indicator report submissions"
      actions={
        <Button size="sm" asChild>
          <Link href="/reports/new">
            <Plus size={14} /> New Report
          </Link>
        </Button>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-card border border-border rounded-lg"
      >
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>

        {serverUser?.role !== 'data_entry' && (
          <Select
            value={orgId || 'all'}
            onValueChange={(v) => setFilters({ org: v === 'all' ? '' : v })}
          >
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="All organisations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organisations</SelectItem>
              {orgs?.map((o) => (
                <SelectItem key={o._id} value={o._id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={year || 'all'}
          onValueChange={(v) => setFilters({ year: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any year</SelectItem>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={quarter || 'all'}
          onValueChange={(v) => setFilters({ quarter: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any quarter</SelectItem>
            {QUARTERS.map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || 'all'}
          onValueChange={(v) => setFilters({ status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(hasFilters || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              resetFilters();
            }}
            className="text-xs h-8 text-muted-foreground"
          >
            <Filter size={12} /> Clear
          </Button>
        )}
      </motion.div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/20">
                {['Organisation', 'Period', 'Status', 'Submitted by', 'Created', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No reports found</p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href="/reports/new">Create first report</Link>
                    </Button>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => <ReportRow key={r._id} report={r} index={i} />)
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={13} />
              </Button>
              <span className="text-xs font-mono text-muted-foreground px-2">
                {page}/{meta.pages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(Math.min(meta.pages, page + 1))}
                disabled={page === meta.pages}
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
