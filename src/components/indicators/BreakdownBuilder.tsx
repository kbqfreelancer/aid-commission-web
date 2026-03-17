'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/index';
import type { BreakdownType } from '@/types';

const BREAKDOWN_TYPES: BreakdownType[] = ['age_only', 'age_sex', 'violation_sex'];

function normalizeKeys(raw: string[]): string[] {
  return [...new Set(raw.map((s) => s.trim()).filter(Boolean))];
}

function ListKeysInput({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  id: string;
}) {
  const text = value.join('\n');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
    onChange(normalizeKeys(lines));
  };
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-700 dark:text-slate-200">
        {label}
      </Label>
      <textarea
        id={id}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        rows={4}
        className="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50 transition-colors"
      />
    </div>
  );
}

export interface BreakdownBlock {
  type: BreakdownType;
  field: string;
  label: string;
  keys?: string[];
  sexKeys?: string[];
  ageKeys?: string[];
  violationKeys?: string[];
}

interface BreakdownBuilderProps {
  breakdown: BreakdownBlock;
  onChange: (b: BreakdownBlock) => void;
  onRemove: () => void;
  index: number;
}

export function BreakdownBlockEditor({ breakdown, onChange, onRemove, index }: BreakdownBuilderProps) {
  const update = (patch: Partial<BreakdownBlock>) => {
    onChange({ ...breakdown, ...patch });
  };

  const handleTypeChange = (type: BreakdownType) => {
    const next: BreakdownBlock = {
      ...breakdown,
      type,
      keys: type === 'age_only' ? breakdown.keys ?? [] : undefined,
      sexKeys: type === 'age_sex' || type === 'violation_sex' ? breakdown.sexKeys ?? ['male', 'female'] : undefined,
      ageKeys: type === 'age_sex' ? breakdown.ageKeys ?? [] : undefined,
      violationKeys: type === 'violation_sex' ? breakdown.violationKeys ?? [] : undefined,
    };
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-muted-foreground">Breakdown {index + 1}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 size={12} /> Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Type</Label>
          <Select value={breakdown.type} onValueChange={(v) => handleTypeChange(v as BreakdownType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BREAKDOWN_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`field-${index}`} className="text-xs font-medium">Field</Label>
          <Input
            id={`field-${index}`}
            value={breakdown.field}
            onChange={(e) => update({ field: e.target.value.trim() })}
            placeholder="e.g. byAge, byAgeSex"
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`label-${index}`} className="text-xs font-medium">Label</Label>
          <Input
            id={`label-${index}`}
            value={breakdown.label}
            onChange={(e) => update({ label: e.target.value.trim() })}
          placeholder="e.g. By Age, By Age and Sex"
        />
      </div>

      {breakdown.type === 'age_only' && (
        <ListKeysInput
          id={`keys-${index}`}
          label="Age keys"
          value={breakdown.keys ?? []}
          onChange={(v) => update({ keys: v })}
          placeholder={'lt_15\n15-19\n20-24\n25-29\n30-34\n35-39\n40-44\n45-49\n50+'}
        />
      )}

      {breakdown.type === 'age_sex' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ListKeysInput
            id={`sexKeys-${index}`}
            label="Sex keys"
            value={breakdown.sexKeys ?? []}
            onChange={(v) => update({ sexKeys: v })}
            placeholder="male\nfemale"
          />
          <ListKeysInput
            id={`ageKeys-${index}`}
            label="Age keys"
            value={breakdown.ageKeys ?? []}
            onChange={(v) => update({ ageKeys: v })}
            placeholder={'lt_15\n15-19\n20-24\n25-29\n30-34\n35-39\n40-44\n45-49\n50+'}
          />
        </div>
      )}

      {breakdown.type === 'violation_sex' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ListKeysInput
            id={`sexKeys-${index}`}
            label="Sex keys"
            value={breakdown.sexKeys ?? []}
            onChange={(v) => update({ sexKeys: v })}
            placeholder="male\nfemale"
          />
          <ListKeysInput
            id={`violationKeys-${index}`}
            label="Violation keys"
            value={breakdown.violationKeys ?? []}
            onChange={(v) => update({ violationKeys: v })}
            placeholder="GBV\nSBV\nStigmaDiscrimination\nDenialOfService\nPhysicalViolence\nOther"
          />
        </div>
      )}
    </div>
  );
}
