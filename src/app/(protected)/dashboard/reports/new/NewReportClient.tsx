'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Save, Send, ArrowLeft, ClipboardList, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_PRIMARY_CLASS, HEADER_BACK_CLASS } from '@/components/layout/headerStyles';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/index';
import { DynamicIndicatorForm } from '@/components/forms/DynamicIndicatorForm';
import { useCreateReport } from '@/hooks/useApi';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { updateReportStatusAction } from '@/lib/actions';
import { toast } from 'sonner';
import type { Organisation, IndicatorDefinition } from '@/types';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function hasAnyValue(obj: unknown): boolean {
    if (typeof obj === 'number') return obj > 0;
    if (obj && typeof obj === 'object')
      return Object.values(obj).some(hasAnyValue);
    return false;
  }

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

export function NewReportClient({
  indicators,
  orgs,
}: {
  indicators: IndicatorDefinition[];
  orgs: Organisation[];
}) {
  const router = useRouter();
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
  const createMutation = useCreateReport();

  const [orgId, setOrgId] = useState('');
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [quarter, setQuarter] = useState<string>('');
  const [month, setMonth] = useState('');
  const [notes, setNotes] = useState('');
  const [indData, setIndData] = useState<Record<string, Record<string, unknown>>>({});
  const [errors, setErrors] = useState<{ org?: string; quarter?: string }>({});
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
    const newErrors: { org?: string; quarter?: string } = {};
    if (!orgId) newErrors.org = 'Select an organisation';
    if (!quarter) newErrors.quarter = 'Select a reporting quarter';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(newErrors.org ?? newErrors.quarter);
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
      const res = await createMutation.mutateAsync(payload);
      const id = res.data?._id;
      if (submitAfter && id) {
        await updateReportStatusAction(id, 'submitted');
        toast.success('Report submitted for review');
      }
      router.push(ROUTES.reports);
    } catch {
      /* error handled by mutation hook */
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setHeader({
      title: 'New Report',
      description: 'Select organisation and period, then enter indicator counts. Save as draft anytime.',
      actions: (
        <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  return (
    <div className="pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:self-start"
          >
            <Card id="report-details" className="lg:sticky lg:top-24 rounded-2xl border-2 border-border bg-card shadow-md scroll-mt-24">
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
                  <Select value={orgId} onValueChange={(v) => { setOrgId(v); setErrors((e) => ({ ...e, org: undefined })); }}>
                    <SelectTrigger className={errors.org ? 'border-red-500 focus:ring-red-500/50' : undefined} aria-invalid={!!errors.org}>
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
                  {errors.org && <p className="text-xs text-red-500" aria-live="polite">{errors.org}</p>}
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
                  <Select value={quarter} onValueChange={(v) => { setQuarter(v); setErrors((e) => ({ ...e, quarter: undefined })); }}>
                    <SelectTrigger className={errors.quarter ? 'border-red-500 focus:ring-red-500/50' : undefined} aria-invalid={!!errors.quarter}>
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
                  {errors.quarter && <p className="text-xs text-red-500" aria-live="polite">{errors.quarter}</p>}
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
                    className={cn('w-full', HEADER_PRIMARY_CLASS)}
                    onClick={() => handleSave(false)}
                    loading={createMutation.isPending}
                  >
                    <Save size={14} /> {createMutation.isPending ? 'Saving…' : 'Save as Draft'}
                  </Button>
                  {['data_entry', 'supervisor', 'admin'].includes(serverUser?.role ?? '') && (
                    <Button
                      variant="outline"
                      className={cn('w-full', HEADER_BACK_CLASS)}
                      onClick={() => handleSave(true)}
                      loading={createMutation.isPending}
                    >
                      <Send size={14} /> {createMutation.isPending ? (isSubmitting ? 'Submitting…' : 'Saving…') : 'Save & Submit'}
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
                <p className="text-xs text-muted-foreground mt-1">
                  Enter counts for each indicator. All fields are optional — save as draft and
                  return later.
                </p>
              </CardHeader>
              <CardContent>
                {indicators?.length ? (
                  <DynamicIndicatorForm
                    indicators={indicators}
                    data={indData}
                    onChange={handleCellChange}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 px-6">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertCircle size={24} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Could not load indicator registry</p>
                    <p className="text-xs text-muted-foreground text-center">Check your connection and try again.</p>
                    <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
                      <Link href={ROUTES.reports}>Back to reports</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
  );
}
