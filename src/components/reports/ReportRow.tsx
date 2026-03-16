'use client';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Eye, Pencil, Trash2, CheckCircle2, XCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { formatDate, quarterLabel } from '@/lib/utils';
import type { HrReport, Organisation, User, ReportStatus } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { useDeleteReport, useUpdateStatus } from '@/hooks/useApi';

export function StatusBadge({ status }: { status: ReportStatus }) {
  const v = status as 'draft' | 'submitted' | 'verified' | 'rejected';
  const labels: Record<typeof v, string> = {
    draft: 'Draft', submitted: 'Submitted', verified: 'Verified', rejected: 'Rejected',
  };
  return <Badge variant={v}>{labels[v]}</Badge>;
}

interface ReportRowProps { report: HrReport; index: number; }

export function ReportRow({ report, index }: ReportRowProps) {
  const { user } = useAuthStore();
  const org  = report.organisation as Organisation;
  const sub  = report.submittedBy as User;
  const del  = useDeleteReport();
  const upSt = useUpdateStatus(report._id);

  const canEdit   = report.status === 'draft' && (user?.role !== 'data_entry' || sub?._id === user._id);
  const canSubmit = report.status === 'draft' && canEdit;
  const canVerify = ['supervisor','admin'].includes(user?.role ?? '') && report.status === 'submitted';
  const canReject = canVerify;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="border-b border-border hover:bg-secondary/30 transition-colors group"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          {org?.name ?? '—'}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{org?.region}</p>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-foreground">
        {report.reportingYear} · {quarterLabel(report.reportingQuarter)}
      </td>
      <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {sub?.name ?? '—'}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
        {formatDate(report.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/reports/${report._id}`}><Eye size={13} /></Link>
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/reports/${report._id}/edit`}><Pencil size={13} /></Link>
            </Button>
          )}
          {canSubmit && (
            <Button variant="ghost" size="icon-sm" className="text-blue-400 hover:text-blue-300"
              onClick={() => upSt.mutate({ status: 'submitted' })}>
              <Send size={13} />
            </Button>
          )}
          {canVerify && (
            <Button variant="ghost" size="icon-sm" className="text-green-400 hover:text-green-300"
              onClick={() => upSt.mutate({ status: 'verified' })}>
              <CheckCircle2 size={13} />
            </Button>
          )}
          {canReject && (
            <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300"
              onClick={() => upSt.mutate({ status: 'rejected' })}>
              <XCircle size={13} />
            </Button>
          )}
          {report.status === 'draft' && (
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive"
              onClick={() => { if (confirm('Delete this draft?')) del.mutate(report._id); }}>
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export function ReportTableSkeleton() {
  return (
    <>{Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-border">
        {Array.from({ length: 6 }).map((_, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 shimmer rounded w-24" />
          </td>
        ))}
      </tr>
    ))}</>
  );
}
