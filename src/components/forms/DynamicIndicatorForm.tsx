'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Input, Label } from '@/components/ui/index';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, toDisplayKey } from '@/lib/utils';
import type { IndicatorDefinition, BreakdownDefinition } from '@/types';

interface Props {
  indicators: IndicatorDefinition[];
  data: Record<string, Record<string, unknown>>;
  onChange: (indicatorId: string, field: string, path: string[], value: number) => void;
}

function hasAnyValue(obj: unknown): boolean {
  if (typeof obj === 'number') return obj > 0;
  if (obj && typeof obj === 'object')
    return Object.values(obj).some(hasAnyValue);
  return false;
}

// ─── Single numeric cell ──────────────────────────────────────────────────────
function CountInput({
  value, onChange, label, id,
}: { value: number; onChange: (v: number) => void; label: string; id: string }) {
  const filled = (value ?? 0) > 0;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <Label htmlFor={id} className="text-xs font-mono truncate">{label}</Label>
      <Input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className={cn(
          'h-8 text-xs font-mono text-center px-1 tabular-nums',
          filled && 'border-amber-500/30 bg-amber-500/5'
        )}
      />
    </div>
  );
}

// ─── Age-only breakdown ───────────────────────────────────────────────────────
function AgeOnlyBreakdown({
  breakdown, data, onCellChange, fieldPrefix,
}: { breakdown: BreakdownDefinition; data: Record<string, unknown>; onCellChange: (path: string[], v: number) => void; fieldPrefix: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 font-mono">{breakdown.label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {(breakdown.keys ?? []).map((k) => (
          <CountInput
            key={k}
            id={`${fieldPrefix}-${k}`}
            label={toDisplayKey(k)}
            value={(data[k] as number) ?? 0}
            onChange={(v) => onCellChange([k], v)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Age × Sex breakdown ──────────────────────────────────────────────────────
function AgeSexBreakdown({
  breakdown, data, onCellChange,
}: { breakdown: BreakdownDefinition; data: Record<string, unknown>; onCellChange: (path: string[], v: number) => void }) {
  const sexKeys = breakdown.sexKeys ?? [];
  const ageKeys = breakdown.ageKeys ?? [];

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 font-mono">{breakdown.label}</p>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-mono text-xs pb-2 pr-3 w-16 sticky left-0 bg-background/95 z-10">Sex</th>
              {ageKeys.map((k) => (
                <th key={k} className="text-center text-muted-foreground font-mono text-xs pb-2 px-1 min-w-[56px]">
                  {toDisplayKey(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sexKeys.map((sex) => {
              const rowData = (data[sex] ?? {}) as Record<string, unknown>;
              return (
                <tr key={sex}>
                  <td className="py-1.5 pr-3 sticky left-0 bg-card/95 z-10">
                    <span className="text-xs font-medium text-foreground capitalize">{sex}</span>
                  </td>
                  {ageKeys.map((k) => (
                    <td key={k} className="py-1.5 px-1">
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={(rowData[k] as number) || ''}
                        placeholder="0"
                        onChange={(e) => onCellChange([sex, k], Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-7 text-xs font-mono text-center px-0.5 min-w-[48px] tabular-nums"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Violation × Sex breakdown ────────────────────────────────────────────────
function ViolationSexBreakdown({
  breakdown, data, onCellChange,
}: { breakdown: BreakdownDefinition; data: Record<string, unknown>; onCellChange: (path: string[], v: number) => void }) {
  const sexKeys  = breakdown.sexKeys ?? [];
  const vtKeys   = breakdown.violationKeys ?? [];

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 font-mono">{breakdown.label}</p>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-mono text-xs pb-2 pr-3 w-16 sticky left-0 bg-background/95 z-10">Sex</th>
              {vtKeys.map((k) => (
                <th key={k} className="text-center text-muted-foreground font-mono text-xs pb-2 px-1 min-w-[60px]">
                  {k.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sexKeys.map((sex) => {
              const rowData = (data[sex] ?? {}) as Record<string, unknown>;
              return (
                <tr key={sex}>
                  <td className="py-1.5 pr-3 sticky left-0 bg-card/95 z-10">
                    <span className="text-xs font-medium text-foreground capitalize">{sex}</span>
                  </td>
                  {vtKeys.map((k) => (
                    <td key={k} className="py-1.5 px-1">
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={(rowData[k] as number) || ''}
                        placeholder="0"
                        onChange={(e) => onCellChange([sex, k], Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-7 text-xs font-mono text-center px-0.5 tabular-nums"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Single Indicator section ────────────────────────────────────────────────
function IndicatorSection({
  indicator, data, onChange,
}: {
  indicator: IndicatorDefinition;
  data: Record<string, unknown>;
  onChange: (field: string, path: string[], value: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const filled = hasAnyValue(data);
  const contentId = `indicator-${indicator.id}-content`;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        aria-label={`Toggle indicator ${indicator.number}`}
        className="w-full flex items-start gap-3 px-5 py-4 bg-card hover:bg-secondary/40 transition-colors text-left"
      >
        <div className={cn(
          'w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold transition-colors',
          open ? 'bg-amber-500 text-navy-950' : 'bg-secondary text-muted-foreground'
        )}>
          {indicator.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug text-balance">{indicator.label}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {indicator.breakdowns.length} breakdown{indicator.breakdowns.length > 1 ? 's' : ''}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[10px] text-muted-foreground/70 font-mono cursor-help">
                  ID: {indicator.id}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-mono">
                ID: {indicator.id}
              </TooltipContent>
            </Tooltip>
            {filled && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-500">
                <Check size={10} aria-hidden /> Filled
              </span>
            )}
          </div>
        </div>
        {open ? <ChevronDown size={14} className="text-muted-foreground shrink-0 mt-1" aria-hidden /> : <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" aria-hidden />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 space-y-6 border-t border-border bg-background/30">
              {indicator.breakdowns.map((bd) => {
                const bdData = (data[bd.field] ?? {}) as Record<string, unknown>;
                const handleCell = (path: string[], value: number) => onChange(bd.field, path, value);

                if (bd.type === 'age_only') {
                  return <AgeOnlyBreakdown key={bd.field} breakdown={bd} data={bdData} onCellChange={handleCell} fieldPrefix={`${indicator.id}-${bd.field}`} />;
                }
                if (bd.type === 'age_sex') {
                  return <AgeSexBreakdown key={bd.field} breakdown={bd} data={bdData} onCellChange={handleCell} />;
                }
                if (bd.type === 'violation_sex') {
                  return <ViolationSexBreakdown key={bd.field} breakdown={bd} data={bdData} onCellChange={handleCell} />;
                }
                return null;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DynamicIndicatorForm({ indicators, data, onChange }: Props) {
  const handleChange = useCallback(
    (indicatorId: string, field: string, path: string[], value: number) => {
      onChange(indicatorId, field, path, value);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      {indicators.map((indicator) => (
        <IndicatorSection
          key={indicator.id}
          indicator={indicator}
          data={(data[indicator.id] ?? {}) as Record<string, unknown>}
          onChange={(field, path, value) => handleChange(indicator.id, field, path, value)}
        />
      ))}
    </div>
  );
}
