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
const BORDER_LIGHT = 'rgba(0,0,0,0.08)';
const BORDER_DARK  = 'rgba(255,255,255,0.06)';

interface BreakdownChartProps {
  breakdown: BreakdownDefinition;
  data: Record<string, unknown>;
  height?: number;
  /** Use light theme (dark grid/text) when chart is on white/light background */
  light?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  light,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
  light?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={
        light
          ? 'bg-white border border-gray-200 rounded-md px-3 py-2 text-xs shadow-xl text-gray-800'
          : 'bg-card border border-border rounded-md px-3 py-2 text-xs shadow-xl'
      }
    >
      <p className={light ? 'font-mono text-gray-500 mb-1' : 'font-mono text-muted-foreground mb-1'}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
          <span className={light ? 'text-gray-700 capitalize' : 'text-foreground capitalize'}>{p.name}:</span>
          <span className={light ? 'font-mono font-semibold text-gray-900' : 'font-mono font-semibold text-foreground'}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export function BreakdownChart({ breakdown, data, height = 220, light }: BreakdownChartProps) {
  const chartData = flattenBreakdown(data, breakdown);
  const borderColor = light ? BORDER_LIGHT : BORDER_DARK;
  const tickColor = light ? '#475569' : '#64748b';
  if (!chartData.length) {
    return (
      <p className={light ? 'text-xs text-gray-500 text-center py-8' : 'text-xs text-muted-foreground text-center py-8'}>
        No data
      </p>
    );
  }

  const isGrouped = breakdown.type !== 'age_only';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={borderColor} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: tickColor, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: tickColor, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip light={light} />}
          cursor={{ fill: light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)' }}
        />
        {isGrouped ? (
          <>
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', paddingTop: 8 }}
              formatter={(v: string) => (
                <span className={light ? 'capitalize text-gray-600' : 'capitalize text-muted-foreground'}>{v}</span>
              )}
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
