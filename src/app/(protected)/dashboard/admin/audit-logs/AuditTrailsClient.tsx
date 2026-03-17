'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ScrollText, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useHeader } from '@/components/layout/HeaderContext';
import { useAdminAuditLogs } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { Badge } from '@/components/ui/index';
import type { AuditLogEntry } from '@/types';

const ENTITY_TYPES = ['Auth', 'HrReport', 'User', 'Organisation'] as const;
const ACTIONS = ['auth.login', 'auth.login_failed', 'create', 'update', 'delete'] as const;

export function AuditTrailsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHeader, clearHeader } = useHeader();

  const page = Number(searchParams.get('page') || '1');
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '50')));
  const entityType = searchParams.get('entityType') || undefined;
  const entityId = searchParams.get('entityId') || undefined;
  const actorId = searchParams.get('actorId') || undefined;
  const action = searchParams.get('action') || undefined;
  const fromRaw = searchParams.get('from') || undefined;
  const toRaw = searchParams.get('to') || undefined;
  const from = fromRaw ? `${fromRaw}T00:00:00.000Z` : undefined;
  const to = toRaw ? `${toRaw}T23:59:59.999Z` : undefined;

  const params = { page, limit, entityType, entityId, actorId, action, from, to };
  const { data, isLoading, isError } = useAdminAuditLogs(params);
  const logs = data?.logs ?? [];
  const meta = data?.meta;

  const setFilters = (updates: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      const val = String(v);
      if (val) next.set(k, val);
      else next.delete(k);
    });
    next.set('page', '1');
    router.push(`${ROUTES.auditLogs}?${next.toString()}`);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    router.push(`${ROUTES.auditLogs}?${next.toString()}`);
  };

  const resetFilters = () => {
    router.push(ROUTES.auditLogs);
  };

  const hasFilters = entityType || entityId || actorId || action || fromRaw || toRaw;

  const [entityIdInput, setEntityIdInput] = useState(entityId || '');
  const [actorIdInput, setActorIdInput] = useState(actorId || '');

  useEffect(() => {
    setEntityIdInput(entityId || '');
  }, [entityId]);
  useEffect(() => {
    setActorIdInput(actorId || '');
  }, [actorId]);

  const applyEntityIdFilter = () => {
    const val = entityIdInput.trim();
    if (val !== (entityId || '')) setFilters({ entityId: val });
  };
  const applyActorIdFilter = () => {
    const val = actorIdInput.trim();
    if (val !== (actorId || '')) setFilters({ actorId: val });
  };

  useEffect(() => {
    setHeader({
      title: 'Audit Trails',
      description: 'Append-only audit trail for compliance and forensics',
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  const actorDisplay = (entry: AuditLogEntry) => {
    const a = entry.actorId;
    if (!a) return '—';
    return a.name || a.email || '—';
  };

  const handleViewLog = (entry: AuditLogEntry) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`audit-log-${entry._id}`, JSON.stringify(entry));
    }
  };

  if (isError) {
    return (
      <div className="rounded-2xl bg-card border border-border p-12 text-center">
        <p className="text-sm font-semibold text-destructive">Failed to load audit logs</p>
        <p className="text-xs text-muted-foreground mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-card border border-border rounded-lg"
      >
        <Select
          value={entityType || 'all'}
          onValueChange={(v) => setFilters({ entityType: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Entity ID"
          value={entityIdInput}
          onChange={(e) => setEntityIdInput(e.target.value)}
          onBlur={applyEntityIdFilter}
          onKeyDown={(e) => e.key === 'Enter' && applyEntityIdFilter()}
          className="h-8 w-40 text-xs font-mono"
        />

        <Input
          placeholder="Actor ID (ObjectId)"
          value={actorIdInput}
          onChange={(e) => setActorIdInput(e.target.value)}
          onBlur={applyActorIdFilter}
          onKeyDown={(e) => e.key === 'Enter' && applyActorIdFilter()}
          className="h-8 w-44 text-xs font-mono"
        />

        <Select
          value={action || 'all'}
          onValueChange={(v) => setFilters({ action: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={fromRaw || ''}
          onChange={(e) => setFilters({ from: e.target.value || '' })}
          className="h-8 w-36 text-xs"
          placeholder="From"
        />
        <Input
          type="date"
          value={toRaw || ''}
          onChange={(e) => setFilters({ to: e.target.value || '' })}
          className="h-8 w-36 text-xs"
          placeholder="To"
        />

        <Select
          value={String(limit)}
          onValueChange={(v) => setFilters({ limit: v })}
        >
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs h-8 text-muted-foreground"
          >
            <X size={12} /> Clear
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card"
      >
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Audit logs</h2>
            <p className="text-xs font-mono text-gray-500 dark:text-muted-foreground">
              {meta
                ? `${(page - 1) * limit + 1}–${Math.min(page * limit, meta.total)} of ${meta.total}`
                : '—'}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-1 dark:text-muted-foreground">
            System activity for compliance and forensics
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] table-auto">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-border dark:bg-muted/40">
                {['Timestamp', 'Actor', 'Action', 'Outcome', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      'px-6 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-muted-foreground',
                      h === 'Actions' && 'sticky right-0 bg-gray-50/95 dark:bg-muted/95 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.2)] whitespace-nowrap'
                    )}
                    style={h === 'Actions' ? { minWidth: 80 } : undefined}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    Loading audit logs…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center dark:bg-amber-500/10">
                        <ScrollText size={20} className="text-amber-500 dark:text-amber-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-foreground">
                        No audit logs found
                      </p>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr
                    key={entry._id}
                    className="group border-b border-gray-100 dark:border-border hover:bg-gray-50/50 dark:hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 text-xs font-mono text-gray-700 dark:text-foreground whitespace-nowrap">
                      {entry.timestamp
                        ? format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss')
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-700 dark:text-foreground">
                      <div className="flex flex-col gap-0.5">
                        <span>{actorDisplay(entry)}</span>
                        {entry.actorRole && (
                          <Badge variant="outline" className="text-[9px] w-fit">
                            {entry.actorRole}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-gray-700 dark:text-foreground">
                      {entry.action}
                    </td>
                    <td className="px-6 py-3">
                      {entry.outcome ? (
                        <Badge
                          variant={entry.outcome === 'success' ? 'verified' : 'rejected'}
                          className="text-[10px]"
                        >
                          {entry.outcome}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="sticky right-0 bg-white px-6 py-3 dark:bg-card group-hover:bg-gray-50/50 dark:group-hover:bg-muted/30 shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.2)]">
                      <Link
                        href={ROUTES.auditLog(entry._id)}
                        onClick={() => handleViewLog(entry)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
                      >
                        <Eye size={14} strokeWidth={2} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {meta && (
        <div className="flex items-center justify-between px-4 py-3 mt-4 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/50">
          <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Page {page} of {meta.pages}
            {meta.total > 0 && (
              <span className="ml-2 text-slate-500 dark:text-slate-500">
                · {meta.total} total
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-lg h-8"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(meta.pages, page + 1))}
              disabled={page === meta.pages}
              className="rounded-lg h-8"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
