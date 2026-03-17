'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_PRIMARY_CLASS, HEADER_BACK_CLASS } from '@/components/layout/headerStyles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/index';
import { BreakdownBlockEditor, type BreakdownBlock } from '@/components/indicators/BreakdownBuilder';
import { useCreateAdminIndicator } from '@/hooks/useApi';
import { toast } from 'sonner';

const DEFAULT_BREAKDOWN: BreakdownBlock = {
  type: 'age_only',
  field: 'byAge',
  label: 'By Age',
  keys: ['lt_15', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50+'],
};

function buildPayload(breakdown: BreakdownBlock): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: breakdown.type,
    field: breakdown.field.trim(),
    label: breakdown.label.trim(),
  };
  if (breakdown.type === 'age_only' && breakdown.keys?.length) {
    base.keys = breakdown.keys;
  }
  if (breakdown.type === 'age_sex') {
    if (breakdown.sexKeys?.length) base.sexKeys = breakdown.sexKeys;
    if (breakdown.ageKeys?.length) base.ageKeys = breakdown.ageKeys;
  }
  if (breakdown.type === 'violation_sex') {
    if (breakdown.sexKeys?.length) base.sexKeys = breakdown.sexKeys;
    if (breakdown.violationKeys?.length) base.violationKeys = breakdown.violationKeys;
  }
  return base;
}

function validate(
  id: string,
  number: string,
  label: string,
  breakdowns: BreakdownBlock[]
): string | null {
  if (!id.trim()) return 'Indicator ID is required';
  if (!number.trim()) return 'Indicator number is required';
  if (!label.trim()) return 'Indicator label is required';
  if (breakdowns.length === 0) return 'Add at least one breakdown';
  for (let i = 0; i < breakdowns.length; i++) {
    const b = breakdowns[i]!;
    if (!b.field.trim()) return `Breakdown ${i + 1}: field is required`;
    if (!b.label.trim()) return `Breakdown ${i + 1}: label is required`;
    if (b.type === 'age_only') {
      if (!b.keys?.length) return `Breakdown ${i + 1}: add at least one age key`;
    }
    if (b.type === 'age_sex') {
      if (!b.sexKeys?.length) return `Breakdown ${i + 1}: add at least one sex key`;
      if (!b.ageKeys?.length) return `Breakdown ${i + 1}: add at least one age key`;
    }
    if (b.type === 'violation_sex') {
      if (!b.sexKeys?.length) return `Breakdown ${i + 1}: add at least one sex key`;
      if (!b.violationKeys?.length) return `Breakdown ${i + 1}: add at least one violation key`;
    }
  }
  return null;
}

export function NewIndicatorClient() {
  const router = useRouter();
  const { setHeader, clearHeader } = useHeader();
  const createMutation = useCreateAdminIndicator();

  const [id, setId] = useState('');
  const [number, setNumber] = useState('');
  const [label, setLabel] = useState('');
  const [breakdowns, setBreakdowns] = useState<BreakdownBlock[]>([{ ...DEFAULT_BREAKDOWN }]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHeader({
      title: 'New Indicator',
      description: 'Create a new HR indicator definition with breakdowns.',
      actions: (
        <div className="flex items-center gap-2">
          <Button size="sm" asChild className={HEADER_BACK_CLASS}>
            <Link href="/indicators">
              <ArrowLeft size={14} /> Back
            </Link>
          </Button>
        </div>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  const addBreakdown = () => {
    setBreakdowns((prev) => [...prev, { ...DEFAULT_BREAKDOWN }]);
  };

  const updateBreakdown = (index: number, b: BreakdownBlock) => {
    setBreakdowns((prev) => {
      const next = [...prev];
      next[index] = b;
      return next;
    });
  };

  const removeBreakdown = (index: number) => {
    setBreakdowns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate(id, number, label, breakdowns);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    const payload = {
      id: id.trim(),
      number: number.trim(),
      label: label.trim(),
      breakdowns: breakdowns.map(buildPayload),
    };

    try {
      await createMutation.mutateAsync(payload);
      router.push('/indicators');
    } catch {
      setError('Failed to create indicator');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Indicator details</CardTitle>
          <CardDescription>
            Unique ID, number, and label for the indicator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="id" className="text-xs font-medium">
                ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. indicator_1"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="number" className="text-xs font-medium">
                Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs font-medium">
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Number of people reached with human rights interventions"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdowns</CardTitle>
          <CardDescription>
            Define one or more breakdown dimensions (age_only, age_sex, violation_sex).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {breakdowns.map((b, i) => (
            <BreakdownBlockEditor
              key={i}
              breakdown={b}
              onChange={(updated) => updateBreakdown(i, updated)}
              onRemove={() => removeBreakdown(i)}
              index={i}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBreakdown}
            className="w-full border-dashed"
          >
            <Plus size={14} /> Add breakdown
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className={HEADER_PRIMARY_CLASS}
        >
          <Save size={14} /> Create indicator
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/indicators">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
