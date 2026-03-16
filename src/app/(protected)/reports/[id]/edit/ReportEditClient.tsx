'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Save, Send, ArrowLeft, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_BACK_CLASS } from '@/components/layout/headerStyles';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/index';
import { DynamicIndicatorForm } from '@/components/forms/DynamicIndicatorForm';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateReport } from '@/hooks/useApi';
import { updateReportStatusAction } from '@/lib/actions';
import { toast } from 'sonner';
import type { Organisation, IndicatorDefinition, HrReport } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function deepSet(
  obj: Record<string, unknown>,
  path: string[],
  value: number
): Record<string, unknown> {
  const result = { ...obj };
  if (path.length === 1) {
    result[path[0]!] = value;
    return result;
  }
  const [head, ...tail] = path;
  result[head!] = deepSet(
    (result[head!] ?? {}) as Record<string, unknown>,
    tail,
    value
  );
  return result;
}

function getOrgId(org: HrReport['organisation']): string {
  return typeof org === 'string' ? org : org?._id ?? '';
}

function hasAnyValue(obj: unknown): boolean {
  if (typeof obj === 'number') return obj > 0;
  if (obj && typeof obj === 'object')
    return Object.values(obj).some(hasAnyValue);
  return false;
}

export function ReportEditClient({
  report,
  indicators,
  orgs,
  id,
}: {
  report: HrReport;
  indicators: IndicatorDefinition[];
  orgs: Organisation[];
  id: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
  const updateMutation = useUpdateReport(id);

  const [orgId, setOrgId] = useState(() => getOrgId(report.organisation));
  const [year, setYear] = useState(() => report.reportingYear.toString());
  const [quarter, setQuarter] = useState<string>(() => report.reportingQuarter);
  const [month, setMonth] = useState(() =>
    report.reportingMonth ? report.reportingMonth.toString() : ''
  );
  const [notes, setNotes] = useState(() => report.notes ?? '');
  const [indData, setIndData] = useState<Record<string, Record<string, unknown>>>(
    () => (report.data ?? {}) as Record<string, Record<string, unknown>>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filledCount = indicators?.filter((ind) => hasAnyValue(indData[ind.id])).length ?? 0;

  const handleCellChange = useCallback(
    (indicatorId: string, field: string, path: string[], value: number) => {
      setIndData((prev) => {
        const indSection = (prev[indicatorId] ?? {}) as Record<string, unknown>;
        const fieldSection = (indSection[field] ?? {}) as Record<string, unknown>;
        return {
          ...prev,
          [indicatorId]: {
            ...indSection,
            [field]: deepSet(fieldSection, path, value),
          },
        };
      });
    },
    []
  );

  const handleSave = async (submitAfter = false) => {
    if (!orgId) {
      toast.error('Select an organisation');
      return;
    }
    if (!quarter) {
      toast.error('Select a reporting quarter');
      return;
    }
    setIsSubmitting(submitAfter);

    const payload = {
      organisation: orgId,
      reportingYear: Number(year),
      reportingQuarter: quarter,
      ...(month ? { reportingMonth: Number(month) } : {}),
      notes: notes || undefined,
      data: indData,
    };

    try {
      await updateMutation.mutateAsync(payload);
      if (submitAfter) {
        await updateReportStatusAction(id, 'submitted');
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        toast.success('Report submitted for review');
      }
      router.push('/reports');
    } catch {
      /* error handled by mutation hook */
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setHeader({
      title: 'Edit Report',
      description: 'Update HR indicator summary report',
      actions: (
        <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
          <Link href={`/reports/${id}`}>
            <ArrowLeft size={13} /> Back
          </Link>
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader, id]);

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:self-start"
        >
          <Card className="lg:sticky lg:top-24 rounded-2xl border-2 border-border bg-card shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Report Details</CardTitle>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <ClipboardList size={16} className="text-amber-500" />
                </div>
              </div>
              <CardDescription className="text-xs mt-1">Organisation and reporting period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Organisation *</Label>
                <Select value={orgId} onValueChange={setOrgId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs?.map((o) => (
                      <SelectItem key={o._id} value={o._id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Reporting Year *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-1.5">
                <Label>Quarter *</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUARTERS.map((q) => (
                      <SelectItem key={q} value={q}>
                        {q}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Month (optional)</Label>
                <Select
                  value={month || '__none__'}
                  onValueChange={(v) => setMonth(v === '__none__' ? '' : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Optional notes for verifier…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleSave(false)}
                  loading={updateMutation.isPending}
                >
                  <Save size={14} /> {updateMutation.isPending ? 'Saving…' : 'Save as Draft'}
                </Button>
                {['data_entry', 'supervisor', 'admin'].includes(serverUser?.role ?? '') && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSave(true)}
                    loading={updateMutation.isPending}
                  >
                    <Send size={14} /> {updateMutation.isPending ? (isSubmitting ? 'Submitting…' : 'Saving…') : 'Save & Submit'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-2xl border border-border bg-card shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Indicator Data</CardTitle>
                {indicators?.length > 0 && (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {filledCount} of {indicators.length} filled
                    </span>
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={filledCount} aria-valuemin={0} aria-valuemax={indicators.length} aria-label="Indicator completion progress">
                      <div
                        className="h-full bg-amber-500/80 rounded-full transition-all duration-300"
                        style={{ width: `${indicators.length ? (filledCount / indicators.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <CardDescription className="text-xs mt-1">
                Enter counts for each indicator. All fields are optional — save as draft and
                return later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {indicators?.length ? (
                <DynamicIndicatorForm
                  indicators={indicators}
                  data={indData}
                  onChange={handleCellChange}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Could not load indicator registry. Check your connection.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
