'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Pencil, Send, CheckCircle2, XCircle, Calendar, Building2, User2, FileText } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Separator } from '@/components/ui/index';
import { StatusBadge } from '@/components/reports/ReportRow';
import { BreakdownChart } from '@/components/charts/BreakdownChart';
import { useUpdateStatus } from '@/hooks/useApi';
import { formatDateTime, quarterLabel, sumNested } from '@/lib/utils';
import type { HrReport, Organisation, User, IndicatorDefinition } from '@/types';

export function ReportDetailClient({
  report,
  indicators,
  id,
  serverUser,
}: {
  report: HrReport;
  indicators: IndicatorDefinition[];
  id: string;
  serverUser: User;
}) {
  const updateStatus = useUpdateStatus(id);
  const org = report.organisation as Organisation;
  const sub = report.submittedBy as User;
  const ver = report.verifiedBy as User | undefined;
  const role = serverUser?.role ?? '';

  const canEdit = report.status === 'draft';
  const canSubmit =
    report.status === 'draft' && ['data_entry', 'supervisor', 'admin'].includes(role);
  const canVerify = ['supervisor', 'admin'].includes(role) && report.status === 'submitted';
  const canReject = canVerify;

  return (
    <AppShell
      serverUser={serverUser}
      title={`Report · ${report.reportingYear} ${quarterLabel(report.reportingQuarter)}`}
      description={org?.name ?? ''}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reports">
              <ArrowLeft size={13} /> Back
            </Link>
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/reports/${id}/edit`}>
                <Pencil size={13} /> Edit
              </Link>
            </Button>
          )}
          {canSubmit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStatus.mutate({ status: 'submitted' })}
              loading={updateStatus.isPending}
            >
              <Send size={13} /> Submit
            </Button>
          )}
          {canVerify && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white"
              onClick={() => updateStatus.mutate({ status: 'verified' })}
              loading={updateStatus.isPending}
            >
              <CheckCircle2 size={13} /> Verify
            </Button>
          )}
          {canReject && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => updateStatus.mutate({ status: 'rejected' })}
              loading={updateStatus.isPending}
            >
              <XCircle size={13} /> Reject
            </Button>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: Building2,
                    label: 'Organisation',
                    value: org?.name ?? '—',
                    sub: `${org?.region} · ${org?.district}`,
                  },
                  {
                    icon: Calendar,
                    label: 'Period',
                    value: `${report.reportingYear} ${quarterLabel(report.reportingQuarter)}`,
                    sub: report.reportingMonth ? `Month ${report.reportingMonth}` : 'Full quarter',
                  },
                  {
                    icon: User2,
                    label: 'Submitted by',
                    value: sub?.name ?? '—',
                    sub: sub?.email ?? '',
                  },
                  {
                    icon: FileText,
                    label: 'Status',
                    value: null,
                    badge: report.status,
                    sub: ver
                      ? `Verified by ${ver.name}`
                      : report.submissionDate
                        ? `Submitted ${formatDateTime(report.submissionDate)}`
                        : `Created ${formatDateTime(report.createdAt)}`,
                  },
                ].map(({ icon: Icon, label, value, sub: subVal, badge }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={12} className="text-muted-foreground" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    {badge ? (
                      <StatusBadge status={badge as 'draft'} />
                    ) : (
                      <p className="text-sm font-medium text-foreground truncate">{value}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{subVal}</p>
                  </div>
                ))}
              </div>
              {report.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-foreground/80">{report.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {indicators?.map((indicator, i) => {
          const indData = (report.data[indicator.id] ?? {}) as Record<string, unknown>;
          const grandTotal = sumNested(indData);

          return (
            <motion.div
              key={indicator.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {indicator.number}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-sm leading-snug">{indicator.label}</CardTitle>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          {indicator.id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xl font-semibold text-amber-400">
                        {grandTotal.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">total</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {indicator.breakdowns.map((bd) => {
                    const bdData = (indData[bd.field] ?? {}) as Record<string, unknown>;
                    return (
                      <div key={bd.field}>
                        <p className="text-xs font-mono text-muted-foreground mb-3">{bd.label}</p>
                        <BreakdownChart breakdown={bd} data={bdData} height={200} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
