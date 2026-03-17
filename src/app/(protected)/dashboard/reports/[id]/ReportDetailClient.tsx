'use client';

import { useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Pencil,
  Send,
  CheckCircle2,
  XCircle,
  Calendar,
  Building2,
  User2,
  FileText,
} from 'lucide-react';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_PRIMARY_CLASS, HEADER_BACK_CLASS } from '@/components/layout/headerStyles';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/index';
import { StatusBadge } from '@/components/reports/ReportRow';
import { BreakdownChart } from '@/components/charts/BreakdownChart';
import { useUpdateStatus } from '@/hooks/useApi';
import { ROUTES } from '@/lib/routes';
import { formatDateTime, quarterLabel, sumNested } from '@/lib/utils';
import type {
  HrReport,
  Organisation,
  User,
  IndicatorDefinition,
  BreakdownDefinition,
} from '@/types';

const METADATA_LABELS = ['Organisation', 'Period', 'Submitted by', 'Status'] as const;

interface ReportHeaderActionsProps {
  id: string;
  canEdit: boolean;
  canSubmit: boolean;
  canVerify: boolean;
  canReject: boolean;
  updateStatusRef: React.MutableRefObject<ReturnType<typeof useUpdateStatus>>;
}

function ReportHeaderActions({
  id,
  canEdit,
  canSubmit,
  canVerify,
  canReject,
  updateStatusRef,
}: ReportHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
        <Link href={ROUTES.reports}>
          <ArrowLeft size={13} /> Back
        </Link>
      </Button>
      {canEdit && (
        <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
          <Link href={ROUTES.reportEdit(id)}>
            <Pencil size={13} /> Edit
          </Link>
        </Button>
      )}
      {canSubmit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateStatusRef.current.mutate({ status: 'submitted' })}
          loading={updateStatusRef.current.isPending}
          className={HEADER_BACK_CLASS}
        >
          <Send size={13} /> Submit
        </Button>
      )}
      {canVerify && (
        <Button
          size="sm"
          onClick={() => updateStatusRef.current.mutate({ status: 'verified' })}
          loading={updateStatusRef.current.isPending}
          className={HEADER_PRIMARY_CLASS}
        >
          <CheckCircle2 size={13} /> Verify
        </Button>
      )}
      {canReject && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => updateStatusRef.current.mutate({ status: 'rejected' })}
          loading={updateStatusRef.current.isPending}
          className="rounded-lg bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
        >
          <XCircle size={13} /> Reject
        </Button>
      )}
    </div>
  );
}

interface IndicatorCardProps {
  indicator: IndicatorDefinition;
  data: Record<string, unknown>;
  index: number;
}

const IndicatorCard = memo(function IndicatorCard({
  indicator,
  data,
  index,
}: IndicatorCardProps) {
  const indData = (data[indicator.id] ?? {}) as Record<string, unknown>;
  const grandTotal = sumNested(indData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-200 bg-white text-gray-900 shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-200">
        <CardHeader className="pb-2 pt-5 px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-mono font-bold text-amber-700">
                  {indicator.number}
                </span>
              </div>
              <div>
                <CardTitle className="text-base leading-snug font-semibold text-gray-900">
                  {indicator.label}
                </CardTitle>
                <p className="text-[11px] font-mono text-gray-500 mt-1">{indicator.id}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-2xl font-bold text-amber-600 tabular-nums">
                {grandTotal.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                total
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2 px-6 pb-6">
          {indicator.breakdowns.map((bd) => (
            <IndicatorBreakdown
              key={bd.field}
              breakdown={bd}
              data={(indData[bd.field] ?? {}) as Record<string, unknown>}
            />
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
});

function IndicatorBreakdown({
  breakdown,
  data,
}: {
  breakdown: BreakdownDefinition;
  data: Record<string, unknown>;
}) {
  return (
    <div>
      <p className="text-xs font-mono font-medium text-gray-500 uppercase tracking-wider mb-3">
        {breakdown.label}
      </p>
      <BreakdownChart breakdown={breakdown} data={data} height={200} light />
    </div>
  );
}

export function ReportDetailClient({
  report,
  indicators,
  id,
}: {
  report: HrReport;
  indicators: IndicatorDefinition[];
  id: string;
}) {
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
  const updateStatus = useUpdateStatus(id);
  const updateStatusRef = useRef(updateStatus);
  updateStatusRef.current = updateStatus;

  const org = report.organisation as Organisation;
  const sub = report.submittedBy as User;
  const ver = report.verifiedBy as User | undefined;
  const role = serverUser?.role ?? '';

  const canEdit = report.status === 'draft';
  const canSubmit =
    report.status === 'draft' && ['data_entry', 'supervisor', 'admin'].includes(role);
  const canVerify = ['supervisor', 'admin'].includes(role) && report.status === 'submitted';
  const canReject = canVerify;

  const title = `Report · ${report.reportingYear} ${quarterLabel(report.reportingQuarter)}`;
  const description = org?.name ?? '';

  useEffect(() => {
    setHeader({
      title,
      description,
      actions: (
        <ReportHeaderActions
          id={id}
          canEdit={canEdit}
          canSubmit={canSubmit}
          canVerify={canVerify}
          canReject={canReject}
          updateStatusRef={updateStatusRef}
        />
      ),
    });
    return clearHeader;
  }, [
    setHeader,
    clearHeader,
    title,
    description,
    id,
    canEdit,
    canSubmit,
    canVerify,
    canReject,
  ]);

  const metadataItems = [
    {
      icon: Building2,
      label: METADATA_LABELS[0],
      value: org?.name ?? '—',
      sub: [org?.region, org?.district].filter(Boolean).join(' · ') || '—',
    },
    {
      icon: Calendar,
      label: METADATA_LABELS[1],
      value: `${report.reportingYear} ${quarterLabel(report.reportingQuarter)}`,
      sub: report.reportingMonth ? `Month ${report.reportingMonth}` : 'Full quarter',
    },
    {
      icon: User2,
      label: METADATA_LABELS[2],
      value: sub?.name ?? '—',
      sub: sub?.email ?? '',
    },
    {
      icon: FileText,
      label: METADATA_LABELS[3],
      value: null,
      badge: report.status,
      sub: ver
        ? `Verified by ${ver.name}`
        : report.submissionDate
          ? `Submitted ${formatDateTime(report.submissionDate)}`
          : `Created ${formatDateTime(report.createdAt)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border border-gray-200 bg-white text-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metadataItems.map(({ icon: Icon, label, value, sub: subVal, badge }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon size={14} className="text-gray-600" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                      {label}
                    </span>
                  </div>
                  {badge ? (
                    <StatusBadge status={badge as 'draft'} light />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                  )}
                  <p className="text-xs text-gray-600 truncate">{subVal}</p>
                </div>
              ))}
            </div>
            {report.notes && (
              <>
                <Separator className="my-5 bg-gray-200" />
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
                    Notes
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed">{report.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-6">
        {indicators?.map((indicator, i) => (
          <IndicatorCard
            key={indicator.id}
            indicator={indicator}
            data={report.data}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
