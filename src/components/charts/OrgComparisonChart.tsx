'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { OrgSummaryRow } from '@/types';
import { sumNested } from '@/lib/utils';

interface Props { rows: OrgSummaryRow[]; indicatorId?: string; variant?: 'default' | 'light'; }

const PALETTE = ['#F2BC1B', '#038C33', '#F22233', '#0ea5e9', '#a855f7', '#14b8a6'];

export function OrgComparisonChart({ rows, indicatorId, variant = 'default' }: Props) {
  const data = rows.map((r) => ({
    name: r.organisation.name.split(' ').slice(0, 2).join(' '),
    value: indicatorId
      ? (r.totals[indicatorId] ?? 0)
      : Object.values(r.totals).reduce((s: number, v) => s + (v as number), 0),
  })).sort((a, b) => b.value - a.value);

  if (!data.length) return <p className={`text-xs text-center py-8 ${variant === 'light' ? 'text-gray-500' : 'text-muted-foreground'}`}>No verified data</p>;

  const isLight = variant === 'light';
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'} />
        <XAxis type="number" tick={{ fontSize: 10, fill: isLight ? '#374151' : '#64748b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: isLight ? '#6b7280' : '#94a3b8', fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={120} />
        <Tooltip
          cursor={{ fill: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className={`rounded px-3 py-2 text-xs shadow-xl ${isLight ? 'bg-white border border-gray-200' : 'bg-card border border-border'}`}>
                <p className={`mb-1 font-mono ${isLight ? 'text-gray-600' : 'text-muted-foreground'}`}>{label}</p>
                <p className="font-mono font-semibold text-brand-gold">{(payload[0]?.value as number)?.toLocaleString()}</p>
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
