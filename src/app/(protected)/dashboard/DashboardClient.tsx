'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Users, FileText, Building2, TrendingUp, Activity, AlertCircle, Filter } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from '@/components/layout/HeaderContext';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { HEADER_PRIMARY_CLASS } from '@/components/layout/headerStyles';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { OrgComparisonChart } from '@/components/charts/OrgComparisonChart';
import { ROUTES } from '@/lib/routes';
import { sumNested } from '@/lib/utils';
import type { HrReport, NationalSummary, OrgSummaryRow, IndicatorDefinition } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function StatusBreakdown({ reports }: { reports: HrReport[] }) {
  const counts = { draft: 0, submitted: 0, verified: 0, rejected: 0 };
  reports.forEach((r) => {
    if (r.status in counts) counts[r.status as keyof typeof counts]++;
  });
  const total = reports.length || 1;

  const statuses = [
    { key: 'verified' as const, label: 'Verified', color: 'bg-emerald-500', track: 'bg-emerald-100' },
    { key: 'submitted' as const, label: 'Submitted', color: 'bg-amber-400', track: 'bg-amber-100' },
    { key: 'draft' as const, label: 'Draft', color: 'bg-slate-400', track: 'bg-slate-100' },
    { key: 'rejected' as const, label: 'Rejected', color: 'bg-rose-500', track: 'bg-rose-100' },
  ] as const;

  return (
    <div className="space-y-4">
      {statuses.map(({ key, label, color, track }) => {
        const pct = Math.round((counts[key] / total) * 100);
        return (
          <div key={key} className="group">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">{label}</span>
              <span className="font-mono font-bold text-gray-900">
                {counts[key]} <span className="font-normal text-gray-500 text-xs">({pct}%)</span>
              </span>
            </div>
            <div className={`h-2.5 ${track} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`h-full rounded-full ${color} shadow-sm`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface DashboardInitialData {
  indicators: IndicatorDefinition[];
  national: NationalSummary | null;
  orgRows: OrgSummaryRow[];
  reports: HrReport[];
}

export function DashboardClient({
  initialData,
  year,
  quarter,
}: {
  initialData: DashboardInitialData;
  year: number;
  quarter: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();

  const { indicators, national, orgRows, reports } = initialData;
  const totalPpl = national ? sumNested(national.indicators) : 0;

  const setFilters = (newYear: number, newQuarter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', String(newYear));
    params.set('quarter', newQuarter);
    router.push(`${ROUTES.dashboard}?${params.toString()}`);
  };

  const hasFilters = year !== new Date().getFullYear() || !!quarter;

  useEffect(() => {
    if (!serverUser) return;
    setHeader({
      title: 'Dashboard',
      description: `Welcome back, ${serverUser.name}. Overview of verified HR indicator data across organisations · ${new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })}`,
      actions: (
        <Button size="sm" asChild className={HEADER_PRIMARY_CLASS}>
          <Link href={ROUTES.reportsNew}>+ New Report</Link>
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader, serverUser]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-card border border-border rounded-lg"
      >
        <span className="text-xs font-medium text-muted-foreground shrink-0">Period:</span>
        <Select
          value={year.toString()}
          onValueChange={(v) => setFilters(Number(v), quarter)}
        >
          <SelectTrigger className="w-24 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={quarter || '__all__'}
          onValueChange={(v) => setFilters(year, v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-28 h-9 text-xs">
            <SelectValue placeholder="All quarters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All quarters</SelectItem>
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <SelectItem key={q} value={q}>
                {q}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.dashboard)}
            className="text-xs h-9 text-muted-foreground"
          >
            <Filter size={12} /> Clear
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch min-h-[150px]">
        <KpiCard
          label="People Reached"
          value={totalPpl}
          icon={Users}
          sub={`${year}${quarter ? ' · ' + quarter : ''} verified`}
          delay={0}
          accentKey="primary"
        />
        <KpiCard
          label="Reports Filed"
          value={national?.reportCount ?? '—'}
          icon={FileText}
          sub="verified submissions"
          delay={0.05}
          accentKey="gold"
        />
        <KpiCard
          label="Organisations"
          value={national?.organisationCount ?? '—'}
          icon={Building2}
          sub="reporting orgs"
          delay={0.1}
          accentKey="blue"
        />
        <KpiCard
          label="Active Indicators"
          value={indicators?.length ?? '—'}
          icon={Activity}
          sub="in registry"
          delay={0.15}
          accentKey="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:col-span-2"
        >
          <div className="h-full rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
            <CardHeader className="pb-2 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900">Reach by Organisation</CardTitle>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Total verified indicator counts per reporting organisation
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!orgRows?.length ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                  <AlertCircle size={24} className="text-gray-400" />
                  <p className="text-sm text-gray-500 font-medium">
                    No verified data for {year}
                    {quarter ? ` ${quarter}` : ''}
                  </p>
                </div>
              ) : (
                <OrgComparisonChart rows={orgRows} variant="light" />
              )}
            </CardContent>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="h-full rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900">Report Status</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Breakdown of all {year} submissions
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <StatusBreakdown reports={reports} />
            </CardContent>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="lg:col-span-3"
        >
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
            <CardHeader className="pb-3 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900">Indicator Registry</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.indicators} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 rounded-lg px-3 py-1.5">
                    View all →
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {indicators?.map((ind, i) => (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400/20 to-orange-500/20 border border-amber-200/50 flex items-center justify-center shrink-0 group-hover:from-amber-400/30 group-hover:to-orange-500/30 transition-colors">
                      <span className="text-sm font-bold text-amber-700">{ind.number}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-950">
                        {ind.label}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1.5">
                        {ind.breakdowns.length} breakdown
                        {ind.breakdowns.length > 1 ? 's' : ''} · <span className="font-mono">{ind.id}</span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </motion.div>
      </div>
    </>
  );
}
