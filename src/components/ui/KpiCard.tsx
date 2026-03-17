'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const KPI_ACCENTS = {
  primary: { bg: 'bg-emerald-500/10', icon: 'text-emerald-600', border: 'border-b-emerald-500' },
  gold: { bg: 'bg-amber-500/10', icon: 'text-amber-600', border: 'border-b-amber-500' },
  blue: { bg: 'bg-sky-500/10', icon: 'text-sky-600', border: 'border-b-sky-500' },
  violet: { bg: 'bg-violet-500/10', icon: 'text-violet-600', border: 'border-b-violet-500' },
} as const;

export type KpiCardAccentKey = keyof typeof KPI_ACCENTS;

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  manageHref?: string;
  delay?: number;
  accentKey?: KpiCardAccentKey;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  manageHref,
  delay = 0,
  accentKey = 'primary',
}: KpiCardProps) {
  const a = KPI_ACCENTS[accentKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full group"
    >
      <div
        className={`h-full relative overflow-hidden rounded-2xl border-b-4 ${a.border} bg-white border border-gray-200 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-border dark:bg-card`}
      >
        <div className="absolute inset-0 bg-linear-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2 dark:text-muted-foreground">
                {label}
              </p>
              <p className="font-display text-3xl font-bold tabular-nums text-gray-900 tracking-tight dark:text-foreground">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {sub && (
                <p className="text-xs text-gray-500 mt-2 font-medium truncate dark:text-muted-foreground">{sub}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.bg} ${a.icon} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
              {manageHref && (
                <Button variant="ghost" size="sm" asChild className={`text-xs h-7 -mr-1 border-b-2 ${a.border}`}>
                  <Link href={manageHref}>Manage →</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
