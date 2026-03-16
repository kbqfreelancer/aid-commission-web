'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Users, FileText, Building2, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { OrgComparisonChart } from '@/components/charts/OrgComparisonChart';
import { sumNested } from '@/lib/utils';
import type { HrReport, NationalSummary, OrgSummaryRow, IndicatorDefinition, User } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  delay = 0,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
    >
      <Card className={`stat-card ${accent ? 'border-amber-500/30' : ''}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
              <p className={`font-display text-3xl ${accent ? 'text-gradient' : 'text-foreground'}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {sub && <p className="text-xs text-muted-foreground mt-1 font-mono">{sub}</p>}
            </div>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ? 'bg-amber-500/15' : 'bg-secondary'}`}
            >
              <Icon size={16} className={accent ? 'text-amber-400' : 'text-muted-foreground'} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusBreakdown({ reports }: { reports: HrReport[] }) {
  const counts = { draft: 0, submitted: 0, verified: 0, rejected: 0 };
  reports.forEach((r) => {
    if (r.status in counts) counts[r.status as keyof typeof counts]++;
  });
  const total = reports.length || 1;

  const statuses = [
    { key: 'verified' as const, label: 'Verified', color: 'bg-green-500' },
    { key: 'submitted' as const, label: 'Submitted', color: 'bg-blue-500' },
    { key: 'draft' as const, label: 'Draft', color: 'bg-muted-foreground' },
    { key: 'rejected' as const, label: 'Rejected', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-2.5">
      {statuses.map(({ key, label, color }) => {
        const pct = Math.round((counts[key] / total) * 100);
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono text-foreground">
                {counts[key]} <span className="text-muted-foreground">({pct}%)</span>
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${color}`}
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
  serverUser,
}: {
  initialData: DashboardInitialData;
  year: number;
  quarter: string;
  serverUser: User;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { indicators, national, orgRows, reports } = initialData;
  const totalPpl = national ? sumNested(national.indicators) : 0;

  const setFilters = (newYear: number, newQuarter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', String(newYear));
    params.set('quarter', newQuarter);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <AppShell
      serverUser={serverUser}
      title="Dashboard"
      description={`Welcome back, ${serverUser.name} · ${new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`}
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={year.toString()}
            onValueChange={(v) => setFilters(Number(v), quarter)}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
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
            <SelectTrigger className="w-28 h-8 text-xs">
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
          <Button size="sm" asChild>
            <Link href="/reports/new">+ New Report</Link>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="People Reached"
          value={totalPpl}
          icon={Users}
          sub={`${year}${quarter ? ' · ' + quarter : ''} verified`}
          delay={0}
          accent
        />
        <KpiCard
          label="Reports Filed"
          value={national?.reportCount ?? '—'}
          icon={FileText}
          sub="verified submissions"
          delay={0.06}
        />
        <KpiCard
          label="Organisations"
          value={national?.organisationCount ?? '—'}
          icon={Building2}
          sub="reporting orgs"
          delay={0.12}
        />
        <KpiCard
          label="Active Indicators"
          value={indicators?.length ?? '—'}
          icon={Activity}
          sub="in registry"
          delay={0.18}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Reach by Organisation</CardTitle>
                <TrendingUp size={14} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Total verified indicator counts per reporting organisation
              </p>
            </CardHeader>
            <CardContent>
              {!orgRows?.length ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <AlertCircle size={20} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    No verified data for {year}
                    {quarter ? ` ${quarter}` : ''}
                  </p>
                </div>
              ) : (
                <OrgComparisonChart rows={orgRows} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report Status</CardTitle>
              <p className="text-xs text-muted-foreground">
                Breakdown of all {year} submissions
              </p>
            </CardHeader>
            <CardContent>
              <StatusBreakdown reports={reports} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Indicator Registry</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/indicators" className="text-xs text-amber-400">
                    View all →
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {indicators?.map((ind, i) => (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-amber-500/20 transition-colors"
                  >
                    <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-bold text-amber-400">{ind.number}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                        {ind.label}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {ind.breakdowns.length} breakdown
                        {ind.breakdowns.length > 1 ? 's' : ''} · {ind.id}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
