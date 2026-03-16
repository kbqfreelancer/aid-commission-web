'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Save, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { updateReportStatusAction } from '@/lib/actions';
import { toast } from 'sonner';
import type { Organisation, IndicatorDefinition, User } from '@/types';

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

export function NewReportClient({
  indicators,
  orgs,
  serverUser,
}: {
  indicators: IndicatorDefinition[];
  orgs: Organisation[];
  serverUser: User;
}) {
  const router = useRouter();
  const createMutation = useCreateReport();

  const [orgId, setOrgId] = useState('');
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [quarter, setQuarter] = useState<string>('');
  const [month, setMonth] = useState('');
  const [notes, setNotes] = useState('');
  const [indData, setIndData] = useState<Record<string, Record<string, unknown>>>({});

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
      router.push('/reports');
    } catch {
      /* error handled by mutation hook */
    }
  };

  return (
    <AppShell
      serverUser={serverUser}
      title="New Report"
      description="Create a new HR indicator summary report"
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reports">
            <ArrowLeft size={13} /> Back
          </Link>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base">Report Details</CardTitle>
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
                    loading={createMutation.isPending}
                  >
                    <Save size={14} /> Save as Draft
                  </Button>
                  {['data_entry', 'supervisor', 'admin'].includes(serverUser?.role ?? '') && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSave(true)}
                      loading={createMutation.isPending}
                    >
                      <Send size={14} /> Save & Submit
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Indicator Data</CardTitle>
                <p className="text-xs text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Could not load indicator registry. Check your connection.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
