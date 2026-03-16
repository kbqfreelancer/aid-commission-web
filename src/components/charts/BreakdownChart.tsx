'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import type { BreakdownDefinition } from '@/types';
import { flattenBreakdown, toDisplayKey } from '@/lib/utils';

interface Props {
  breakdown: BreakdownDefinition;
  data: Record<string, unknown>;
  height?: number;
}

const AMBER  = '#f98a07';
const CYAN   = '#0ea5e9';
const BORDER = 'rgba(255,255,255,0.06)';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-xl">
      <p className="font-mono text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          <span className="text-foreground capitalize">{p.name}:</span>
          <span className="font-mono font-semibold text-foreground">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function BreakdownChart({ breakdown, data, height = 220 }: Props) {
  const chartData = flattenBreakdown(data, breakdown);
  if (!chartData.length) return <p className="text-xs text-muted-foreground text-center py-8">No data</p>;

  const isGrouped = breakdown.type !== 'age_only';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={BORDER} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        {isGrouped ? (
          <>
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', paddingTop: 8 }}
              formatter={(v: string) => <span className="capitalize text-muted-foreground">{v}</span>}
            />
            <Bar dataKey="male"   fill={CYAN}  radius={[2, 2, 0, 0]} maxBarSize={24} />
            <Bar dataKey="female" fill={AMBER} radius={[2, 2, 0, 0]} maxBarSize={24} />
          </>
        ) : (
          <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={32}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={`hsl(${38 + i * 8}, ${80 - i * 2}%, ${50 + i * 2}%)`} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
