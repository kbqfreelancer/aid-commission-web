import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (d: string | Date) =>
  format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy');

export const formatDateTime = (d: string | Date) =>
  format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy, HH:mm');

export const toDisplayKey = (key: string) => key.replace('lt_', '<');

export const statusColors: Record<string, string> = {
  draft:     'status-draft',
  submitted: 'status-submitted',
  verified:  'status-verified',
  rejected:  'status-rejected',
};

export const quarterLabel = (q: string) => ({ Q1: 'Jan–Mar', Q2: 'Apr–Jun', Q3: 'Jul–Sep', Q4: 'Oct–Dec' }[q] ?? q);

/** Sum all numeric leaves of a nested object */
export const sumNested = (obj: unknown): number => {
  if (typeof obj === 'number') return obj;
  if (typeof obj === 'object' && obj !== null)
    return Object.values(obj).reduce<number>((s, v) => s + sumNested(v), 0);
  return 0;
};

/** Flatten nested indicator data into chart-friendly { name, value } pairs */
export const flattenBreakdown = (
  data: Record<string, unknown>,
  breakdown: { type: string; sexKeys?: string[]; ageKeys?: string[]; violationKeys?: string[]; categoryKeys?: string[]; keys?: string[] }
): { name: string; male?: number; female?: number; value?: number }[] => {
  if (breakdown.type === 'age_only') {
    return (breakdown.keys ?? []).map((k) => ({
      name: toDisplayKey(k),
      value: (data[k] as number) ?? 0,
    }));
  }
  if (breakdown.type === 'age_sex') {
    const male   = (data['male']   ?? {}) as Record<string, number>;
    const female = (data['female'] ?? {}) as Record<string, number>;
    return (breakdown.ageKeys ?? []).map((k) => ({
      name:   toDisplayKey(k),
      male:   male[k]   ?? 0,
      female: female[k] ?? 0,
    }));
  }
  if (breakdown.type === 'violation_sex') {
    const male   = (data['male']   ?? {}) as Record<string, number>;
    const female = (data['female'] ?? {}) as Record<string, number>;
    return (breakdown.violationKeys ?? []).map((k) => ({
      name:   k.replace(/([A-Z])/g, ' $1').trim(),
      male:   male[k]   ?? 0,
      female: female[k] ?? 0,
    }));
  }
  return [];
};
