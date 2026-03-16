'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ChevronDown, ChevronRight, Database, Grid3x3, Layers } from 'lucide-react';
import { useHeader } from '@/components/layout/HeaderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/index';
import { toDisplayKey } from '@/lib/utils';
import type { BreakdownDefinition, IndicatorDefinition } from '@/types';

const BREAKDOWN_ICONS: Record<string, React.ElementType> = {
  age_only: Activity,
  age_sex: Grid3x3,
  violation_sex: Layers,
  category_sex: Database,
};

function BreakdownDetail({ bd }: { bd: BreakdownDefinition }) {
  const Icon = BREAKDOWN_ICONS[bd.type] ?? Activity;
  const keys =
    bd.type === 'age_only'
      ? bd.keys
      : bd.type === 'age_sex'
        ? bd.ageKeys
        : bd.type === 'violation_sex'
          ? bd.violationKeys
          : bd.type === 'category_sex'
            ? bd.categoryKeys
            : [];

  return (
    <div className="p-4 bg-background/50 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-amber-400" />
        <span className="text-xs font-medium text-foreground">{bd.label}</span>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {bd.type}
        </Badge>
      </div>
      <div className="space-y-2">
        {bd.type !== 'age_only' && bd.sexKeys && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-1">Sex dimension</p>
            <div className="flex gap-1.5 flex-wrap">
              {bd.sexKeys.map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded bg-secondary text-xs font-mono capitalize"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {keys && keys.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-muted-foreground mb-1">
              {bd.type === 'age_only' || bd.type === 'age_sex'
                ? 'Age bands'
                : bd.type === 'violation_sex'
                  ? 'Violation types'
                  : 'Categories'}{' '}
              ({keys.length})
            </p>
            <div className="flex gap-1 flex-wrap">
              {keys.map((k) => (
                <span
                  key={k}
                  className="px-1.5 py-0.5 rounded bg-secondary/60 text-[10px] font-mono text-muted-foreground"
                >
                  {bd.type === 'age_only' || bd.type === 'age_sex' ? toDisplayKey(k) : k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IndicatorCard({
  indicator,
  index,
}: {
  indicator: IndicatorDefinition;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full text-left p-5 hover:bg-secondary/20 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-amber-500 text-navy-950' : 'bg-amber-500/10 border border-amber-500/20'}`}
            >
              <span
                className={`text-sm font-mono font-bold ${open ? 'text-navy-950' : 'text-amber-400'}`}
              >
                {indicator.number}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-snug">{indicator.label}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground">{indicator.id}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {indicator.breakdowns.length} breakdown
                  {indicator.breakdowns.length !== 1 ? 's' : ''}
                </span>
                {indicator.breakdowns.map((bd) => (
                  <Badge key={bd.field} variant="outline" className="text-[9px] px-1.5">
                    {bd.type}
                  </Badge>
                ))}
              </div>
            </div>
            {open ? (
              <ChevronDown size={14} className="text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                {indicator.breakdowns.map((bd) => (
                  <BreakdownDetail key={bd.field} bd={bd} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function IndicatorsClient({
  indicators,
}: {
  indicators: IndicatorDefinition[];
}) {
  const { setHeader, clearHeader } = useHeader();
  const totalBreakdowns = indicators?.reduce((s, i) => s + i.breakdowns.length, 0) ?? 0;
  const breakdownTypes = [...new Set(indicators?.flatMap((i) => i.breakdowns.map((b) => b.type)) ?? [])];

  useEffect(() => {
    setHeader({
      title: 'Indicator Registry',
      description: 'Live view of all HR indicators defined in the system. Updates automatically when the registry changes.',
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4 mb-6"
      >
        {[
          { label: 'Indicators', value: indicators?.length ?? '—', icon: Activity },
          { label: 'Total Breakdowns', value: totalBreakdowns || '—', icon: Grid3x3 },
          { label: 'Breakdown Types', value: breakdownTypes.length || '—', icon: Layers },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-amber-400" />
              </div>
              <div>
                <p className="font-mono text-lg font-semibold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {breakdownTypes.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">Breakdown types:</span>
          {breakdownTypes.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {indicators?.length === 0 ? (
        <div className="text-center py-16">
          <Activity size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No indicators in registry</p>
        </div>
      ) : (
        <div className="space-y-3">
          {indicators?.map((ind, i) => (
            <IndicatorCard key={ind.id} indicator={ind} index={i} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 border border-amber-500/15 rounded-lg bg-amber-500/5"
      >
        <p className="text-xs text-amber-400/80 font-mono font-medium mb-1">Developer note</p>
        <p className="text-xs text-muted-foreground">
          To add a new indicator, edit{' '}
          <code className="font-mono bg-secondary px-1 py-0.5 rounded text-[11px]">
            src/constants/indicators.ts
          </code>{' '}
          on the backend and restart. The registry is fetched from{' '}
          <code className="font-mono bg-secondary px-1 py-0.5 rounded text-[11px]">
            GET /api/v1/indicators
          </code>{' '}
          at runtime — all form fields, validation, and charts update automatically.
        </p>
      </motion.div>
    </>
  );
}
