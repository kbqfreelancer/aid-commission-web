'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Eye, Pencil, Trash2, CheckCircle2, XCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, quarterLabel } from '@/lib/utils';
import type { HrReport, Organisation, User, ReportStatus } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { useDeleteReport, useUpdateStatus } from '@/hooks/useApi';
import { toast } from 'sonner';

export function StatusBadge({ status, light }: { status: ReportStatus; light?: boolean }) {
  const v = status as 'draft' | 'submitted' | 'verified' | 'rejected';
  const labels: Record<typeof v, string> = {
    draft: 'Draft', submitted: 'Submitted', verified: 'Verified', rejected: 'Rejected',
  };
  const lightClass: Record<typeof v, string> = {
    draft: 'bg-gray-200 text-gray-800 border-gray-300',
    submitted: 'bg-blue-100 text-blue-800 border-blue-200',
    verified: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant={v} className={light ? lightClass[v] : undefined}>
      {labels[v]}
    </Badge>
  );
}

interface ReportRowProps { report: HrReport; index: number; }

export function ReportRow({ report, index }: ReportRowProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const org  = report.organisation as Organisation;
  const sub  = report.submittedBy as User;
  const del  = useDeleteReport();
  const upSt = useUpdateStatus(report._id);

  const handleDelete = () => {
    toast('Delete this draft?', {
      description: 'This report will be permanently deleted and cannot be recovered.',
      duration: 8000,
      classNames: {
        toast: '!bg-red-600 !border-red-700 !text-white',
        title: '!text-white !font-semibold',
        description: '!text-red-100',
        actionButton: '!bg-white !text-red-600 !font-medium hover:!bg-red-50',
        cancelButton: '!bg-red-700 !text-red-100 hover:!bg-red-800',
      },
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await del.mutateAsync(report._id);
            router.refresh();
          } catch {
            toast.error('Failed to delete report. Please try again.');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const canEdit   = report.status === 'draft' && (user?.role !== 'data_entry' || sub?._id === user._id);
  const canSubmit = report.status === 'draft' && canEdit;
  const canVerify = ['supervisor','admin'].includes(user?.role ?? '') && report.status === 'submitted';
  const canReject = canVerify;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
    >
      <td className="px-6 py-3.5">
        <p className="text-sm font-medium text-gray-900">
          {org?.name ?? '—'}
        </p>
        <p className="text-xs text-gray-500 font-mono">{org?.region}</p>
      </td>
      <td className="px-6 py-3.5 text-sm text-gray-900">
        {report.reportingYear} · {quarterLabel(report.reportingQuarter)}
      </td>
      <td className="px-6 py-3.5"><StatusBadge status={report.status} /></td>
      <td className="px-6 py-3.5 text-xs text-gray-600">
        {sub?.name ?? '—'}
      </td>
      <td className="px-6 py-3.5 text-xs text-gray-500 font-mono">
        {formatDate(report.createdAt)}
      </td>
      <td className="px-6 py-3.5 whitespace-nowrap align-middle" style={{ minWidth: 200 }}>
        <div className="inline-flex items-center gap-0.5 rounded-xl bg-gray-50/80 p-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                className="h-8 w-8 rounded-lg text-sky-600 hover:text-sky-700 hover:bg-sky-50/80 transition-colors"
              >
                <Link href={`/reports/${report._id}`}><Eye size={16} strokeWidth={2} /></Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="font-medium">View</TooltipContent>
          </Tooltip>
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  asChild
                  className="h-8 w-8 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50/80 transition-colors"
                >
                  <Link href={`/reports/${report._id}/edit`}><Pencil size={16} strokeWidth={2} /></Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">Edit</TooltipContent>
            </Tooltip>
          )}
          {canSubmit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/80 transition-colors"
                  onClick={() => upSt.mutate({ status: 'submitted' })}
                >
                  <Send size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">Submit</TooltipContent>
            </Tooltip>
          )}
          {canVerify && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/80 transition-colors"
                  onClick={() => upSt.mutate({ status: 'verified' })}
                >
                  <CheckCircle2 size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">Verify</TooltipContent>
            </Tooltip>
          )}
          {canReject && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50/80 transition-colors"
                  onClick={() => upSt.mutate({ status: 'rejected' })}
                >
                  <XCircle size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">Reject</TooltipContent>
            </Tooltip>
          )}
          {report.status === 'draft' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 transition-colors"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} strokeWidth={2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">Delete</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export function ReportTableSkeleton() {
  return (
    <>{Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-gray-100">
        {Array.from({ length: 6 }).map((_, j) => (
          <td key={j} className="px-6 py-3.5">
            <div className="h-4 shimmer-skeleton rounded w-24" />
          </td>
        ))}
      </tr>
    ))}</>
  );
}
