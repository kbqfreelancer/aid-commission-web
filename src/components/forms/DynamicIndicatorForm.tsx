'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input, Label } from '@/components/ui/index';
import { cn, toDisplayKey } from '@/lib/utils';
import type { IndicatorDefinition, BreakdownDefinition } from '@/types';

interface Props {
  indicators: IndicatorDefinition[];
  data: Record<string, Record<string, unknown>>;
  onChange: (indicatorId: string, field: string, path: string[], value: number) => void;
}

// ─── Single numeric cell ──────────────────────────────────────────────────────
function CountInput({
  value, onChange, label,
}: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <Label className="text-[10px] font-mono truncate">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="h-8 text-xs font-mono text-center px-1"
      />
    </div>
  );
}

// ─── Age-only breakdown ───────────────────────────────────────────────────────
function AgeOnlyBreakdown({
  breakdown, data, onCellChange,
}: { breakdown: BreakdownDefinition; data: Record<string, unknown>; onCellChange: (path: string[], v: number) => void }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 font-mono">{breakdown.label}</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
        {(breakdown.keys ?? []).map((k) => (
          <CountInput
            key={k}
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
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-mono text-[10px] pb-2 pr-3 w-16">Sex</th>
              {ageKeys.map((k) => (
                <th key={k} className="text-center text-muted-foreground font-mono text-[10px] pb-2 px-1 min-w-[56px]">
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
                  <td className="py-1.5 pr-3">
                    <span className="text-xs font-medium text-foreground capitalize">{sex}</span>
                  </td>
                  {ageKeys.map((k) => (
                    <td key={k} className="py-1.5 px-1">
                      <Input
                        type="number"
                        min={0}
                        value={(rowData[k] as number) || ''}
                        placeholder="0"
                        onChange={(e) => onCellChange([sex, k], Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-7 text-xs font-mono text-center px-0.5 min-w-[48px]"
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
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-mono text-[10px] pb-2 pr-3 w-16">Sex</th>
              {vtKeys.map((k) => (
                <th key={k} className="text-center text-muted-foreground font-mono text-[10px] pb-2 px-1 min-w-[60px]">
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
                  <td className="py-1.5 pr-3">
                    <span className="text-xs font-medium text-foreground capitalize">{sex}</span>
                  </td>
                  {vtKeys.map((k) => (
                    <td key={k} className="py-1.5 px-1">
                      <Input
                        type="number"
                        min={0}
                        value={(rowData[k] as number) || ''}
                        placeholder="0"
                        onChange={(e) => onCellChange([sex, k], Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-7 text-xs font-mono text-center px-0.5"
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

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 px-5 py-4 bg-card hover:bg-secondary/40 transition-colors text-left"
      >
        <div className={cn(
          'w-7 h-7 rounded flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold transition-colors',
          open ? 'bg-amber-500 text-navy-950' : 'bg-secondary text-muted-foreground'
        )}>
          {indicator.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{indicator.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {indicator.breakdowns.length} breakdown{indicator.breakdowns.length > 1 ? 's' : ''} · ID: <span className="font-mono">{indicator.id}</span>
          </p>
        </div>
        {open ? <ChevronDown size={14} className="text-muted-foreground shrink-0 mt-1" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
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
                  return <AgeOnlyBreakdown key={bd.field} breakdown={bd} data={bdData} onCellChange={handleCell} />;
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
