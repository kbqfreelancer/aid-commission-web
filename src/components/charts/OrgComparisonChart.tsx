'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { OrgSummaryRow } from '@/types';
import { sumNested } from '@/lib/utils';

interface Props { rows: OrgSummaryRow[]; indicatorId?: string; }

const PALETTE = ['#f98a07','#0ea5e9','#22c55e','#a855f7','#f43f5e','#14b8a6'];

export function OrgComparisonChart({ rows, indicatorId }: Props) {
  const data = rows.map((r) => ({
    name: r.organisation.name.split(' ').slice(0, 2).join(' '),
    value: indicatorId
      ? (r.totals[indicatorId] ?? 0)
      : Object.values(r.totals).reduce((s: number, v) => s + (v as number), 0),
  })).sort((a, b) => b.value - a.value);

  if (!data.length) return <p className="text-xs text-muted-foreground text-center py-8">No verified data</p>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={120} />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="bg-card border border-border rounded px-3 py-2 text-xs shadow-xl">
                <p className="text-muted-foreground mb-1 font-mono">{label}</p>
                <p className="font-mono font-semibold text-amber-400">{(payload[0]?.value as number)?.toLocaleString()}</p>
              </div>
            ) : null
          }
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={22}>
          {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length] ?? PALETTE[0]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
