'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHeader } from '@/components/layout/HeaderContext';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { ReportRow, ReportTableSkeleton } from '@/components/reports/ReportRow';
import type { HrReport, Organisation } from '@/types';

const STATUSES = ['draft', 'submitted', 'verified', 'rejected'] as const;
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export function ReportsClient({
  reports,
  orgs,
  meta,
}: {
  reports: HrReport[];
  orgs: Organisation[];
  meta: { total: number; page: number; limit: number; pages: number } | undefined;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
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

  useEffect(() => {
    setHeader({
      title: 'Reports',
      description: 'Manage and track HR indicator report submissions',
      actions: (
        <Button size="sm" asChild className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all">
          <Link href="/reports/new">
            <Plus size={14} /> New Report
          </Link>
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  return (
    <>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg"
      >
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Reports</h2>
            <p className="text-xs font-mono text-gray-500">
              {meta ? `${(page - 1) * 20 + 1}–${Math.min(page * 20, meta.total)} of ${meta.total}` : '—'}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            HR indicator report submissions asdfasdfds
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] table-auto">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                {['Organisation', 'Period', 'Status', 'Submitted by', 'Created', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-6 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-gray-500',
                        h === 'Actions' && 'whitespace-nowrap'
                      )}
                      style={h === 'Actions' ? { minWidth: 200 } : undefined}
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
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className="text-sm text-gray-500 font-medium">No reports found</p>
                    <Button variant="outline" size="sm" className="mt-4 rounded-lg" asChild>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-xs font-mono text-gray-500">
              Page {page} of {meta.pages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg h-8"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(meta.pages, page + 1))}
                disabled={page === meta.pages}
                className="rounded-lg h-8"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
