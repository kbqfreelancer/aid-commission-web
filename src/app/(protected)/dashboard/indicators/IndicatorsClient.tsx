'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ChevronDown, ChevronRight, Database, Grid3x3, Layers, Plus, Search, X } from 'lucide-react';
import { useHeader } from '@/components/layout/HeaderContext';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { HEADER_PRIMARY_CLASS } from '@/components/layout/headerStyles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/KpiCard';
import { Badge, Input } from '@/components/ui/index';
import { ROUTES } from '@/lib/routes';
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
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 dark:bg-muted/40 dark:border-border">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-amber-500" />
        <span className="text-xs font-medium text-gray-900 dark:text-foreground">{bd.label}</span>
        <Badge variant="outline" className="text-[10px] ml-auto border-gray-200 dark:border-border">
          {bd.type}
        </Badge>
      </div>
      <div className="space-y-2">
        {bd.type !== 'age_only' && bd.sexKeys && (
          <div>
            <p className="text-[10px] font-mono text-gray-500 dark:text-muted-foreground mb-1">Sex dimension</p>
            <div className="flex gap-1.5 flex-wrap">
              {bd.sexKeys.map((k) => (
                <span
                  key={k}
                  className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono capitalize text-gray-700 dark:bg-secondary dark:text-muted-foreground"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {keys && keys.length > 0 && (
          <div>
            <p className="text-[10px] font-mono text-gray-500 dark:text-muted-foreground mb-1">
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
                  className="px-1.5 py-0.5 rounded bg-gray-200/80 text-[10px] font-mono text-gray-600 dark:bg-secondary/60 dark:text-muted-foreground"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
    >
      <Card className="group overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-amber-400/60 hover:shadow-md dark:border-border dark:bg-card">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full text-left p-5 transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/30"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors border ${
                open
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
              }`}
            >
              <span className="text-sm font-mono font-bold">{indicator.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-foreground leading-snug">{indicator.label}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500 dark:text-muted-foreground">{indicator.id}</span>
                <span className="text-slate-300 dark:text-muted-foreground/40">·</span>
                <span className="text-[10px] text-slate-500 dark:text-muted-foreground">
                  {indicator.breakdowns.length} breakdown
                  {indicator.breakdowns.length !== 1 ? 's' : ''}
                </span>
                {indicator.breakdowns.map((bd) => (
                  <Badge key={bd.field} variant="outline" className="text-[9px] px-1.5 border-slate-200 dark:border-border">
                    {bd.type}
                  </Badge>
                ))}
              </div>
            </div>
            {open ? (
              <ChevronDown size={14} className="text-slate-400 dark:text-muted-foreground shrink-0 mt-1" />
            ) : (
              <ChevronRight size={14} className="text-slate-400 dark:text-muted-foreground shrink-0 mt-1" />
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
              <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-border pt-4">
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
  const serverUser = useServerUser();
  const isAdmin = serverUser?.role === 'admin';
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const totalBreakdowns = indicators?.reduce((s, i) => s + i.breakdowns.length, 0) ?? 0;
  const breakdownTypes = [...new Set(indicators?.flatMap((i) => i.breakdowns.map((b) => b.type)) ?? [])];

  useEffect(() => {
    setHeader({
      title: 'Indicator Registry',
      description: 'Live view of all HR indicators defined in the system. Updates automatically when the registry changes.',
      actions: isAdmin ? (
        <Button size="sm" asChild className={HEADER_PRIMARY_CLASS}>
          <Link href={ROUTES.indicatorsNew}>
            <Plus size={14} /> Add indicator
          </Link>
        </Button>
      ) : undefined,
    });
    return clearHeader;
  }, [setHeader, clearHeader, isAdmin]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 180);
    return () => window.clearTimeout(id);
  }, [searchInput]);

  const filtered =
    indicators?.filter(
      (i) =>
        i.label.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase()) ||
        i.number.toString().includes(search)
    ) ?? [];

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 items-stretch min-h-[120px]">
        <KpiCard
          label="Indicators"
          value={indicators?.length ?? '—'}
          icon={Activity}
          delay={0}
          accentKey="primary"
        />
        <KpiCard
          label="Total Breakdowns"
          value={totalBreakdowns || '—'}
          icon={Grid3x3}
          delay={0.05}
          accentKey="gold"
        />
        <KpiCard
          label="Breakdown Types"
          value={breakdownTypes.length || '—'}
          icon={Layers}
          delay={0.1}
          accentKey="blue"
        />
      </div>

      {/* Search bar - Organisations style */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, ID or number…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 rounded-lg border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-border dark:bg-background dark:text-foreground"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600 dark:hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <span className="shrink-0 text-xs text-slate-400 dark:text-muted-foreground">
          {indicators?.length ?? 0} total
        </span>
      </div>

      {/* Breakdown types - Reports filter bar style */}
      {breakdownTypes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-card border border-border rounded-lg"
        >
          <span className="text-xs text-slate-500 dark:text-muted-foreground font-medium">Breakdown types:</span>
          {breakdownTypes.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] border-slate-200 dark:border-border">
              {t}
            </Badge>
          ))}
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center dark:border-border/60 dark:bg-muted/40">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-400 dark:bg-amber-500/10 dark:text-amber-500">
            <Activity size={22} />
          </div>
          <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-foreground">
            No indicators found
          </p>
          <p className="max-w-xs text-xs text-slate-500 dark:text-muted-foreground">
            {search
              ? `No results for "${search}". Try a different name, ID, or number.`
              : 'No indicators in registry.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-slate-700 dark:text-foreground">{filtered.length}</span>
              {' '}of{' '}
              <span className="font-medium text-slate-700 dark:text-foreground">{indicators?.length ?? 0}</span>
              {' '}indicator{indicators?.length !== 1 ? 's' : ''}
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-border dark:bg-muted dark:hover:text-foreground"
              >
                <X size={10} />
                Clear search
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filtered.map((ind, i) => (
              <IndicatorCard key={ind.id} indicator={ind} index={i} />
            ))}
          </div>
        </>
      )}

      {/* Developer note - Reports card style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden dark:border-border dark:bg-card"
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-border">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest dark:text-amber-400">Developer note</p>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">
            To add a new indicator, edit{' '}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-800 dark:bg-muted dark:text-foreground">
              src/constants/indicators.ts
            </code>{' '}
            on the backend and restart. The registry is fetched from{' '}
            <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-800 dark:bg-muted dark:text-foreground">
              GET /api/v1/indicators
            </code>{' '}
            at runtime — all form fields, validation, and charts update automatically.
          </p>
        </div>
      </motion.div>
    </>
  );
}
