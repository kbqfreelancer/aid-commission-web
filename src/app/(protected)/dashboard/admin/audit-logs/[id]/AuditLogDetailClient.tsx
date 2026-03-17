'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  User2,
  Activity,
  Globe,
  FileText,
  ScrollText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ROUTES } from '@/lib/routes';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_BACK_CLASS } from '@/components/layout/headerStyles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/index';
import type { AuditLogEntry } from '@/types';

const STORAGE_KEY_PREFIX = 'audit-log-';

export function AuditLogDetailClient({ id }: { id: string }) {
  const { setHeader, clearHeader } = useHeader();
  const [entry, setEntry] = useState<AuditLogEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as AuditLogEntry;
        setEntry(parsed);
      }
    } catch {
      setEntry(null);
    }
    setMounted(true);
  }, [id]);

  useEffect(() => {
    setHeader({
      title: 'Audit Log',
      description: entry ? `${entry.action} · ${entry.entityType}` : 'Loading…',
      actions: (
        <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
          <Link href={ROUTES.auditLogs}>
            <ArrowLeft size={13} /> Back
          </Link>
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader, entry]);

  if (!mounted) {
    return (
      <div className="rounded-2xl bg-card border-2 border-slate-200 dark:border-slate-700 p-12 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="rounded-2xl bg-card border-2 border-slate-200 dark:border-slate-700 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-amber-500/20 flex items-center justify-center">
            <ScrollText size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Log not found or expired</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Please navigate from the audit logs list. Direct links or page refresh may clear the data.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className={HEADER_BACK_CLASS}>
            <Link href={ROUTES.auditLogs}>Back to Audit Trails</Link>
          </Button>
        </div>
      </div>
    );
  }

  const metadataEntries = entry.metadata
    ? Object.entries(entry.metadata).map(([k, v]) => ({
        key: k,
        value: typeof v === 'object' ? JSON.stringify(v) : String(v),
      }))
    : [];

  return (
    <div className="space-y-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-2 border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900/95">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Summary</CardTitle>
              <Badge
                variant={entry.outcome === 'success' ? 'verified' : 'rejected'}
                className="text-[11px] font-semibold"
              >
                {entry.outcome ?? '—'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Timestamp
                  </span>
                </div>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                  {entry.timestamp
                    ? format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')
                    : '—'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Action
                  </span>
                </div>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{entry.action}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Entity Type
                  </span>
                </div>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{entry.entityType}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Entity ID
                </span>
                <p className="text-sm font-mono break-all text-slate-800 dark:text-slate-200">{entry.entityId ?? '—'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Status Code
                </span>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{entry.statusCode ?? '—'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Log ID
                </span>
                <p className="text-sm font-mono break-all text-slate-600 dark:text-slate-400">{entry._id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {entry.actorId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <Card className="overflow-hidden border-2 border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900/95">
            <CardHeader className="pb-2 pt-6 px-6">
              <div className="flex items-center gap-2">
                <User2 size={16} className="text-slate-600 dark:text-slate-400" />
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Actor</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Name
                  </span>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.actorId.name}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Email
                  </span>
                  <p className="text-sm font-mono text-slate-900 dark:text-slate-100">{entry.actorId.email}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Role
                  </span>
                  <p className="text-sm">
                    {entry.actorRole ? (
                      <Badge variant="outline" className="text-[11px] border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                        {entry.actorRole}
                      </Badge>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">—</span>
                    )}
                  </p>
                </div>
                <div className="space-y-2 col-span-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Actor ID
                  </span>
                  <p className="text-sm font-mono break-all text-slate-600 dark:text-slate-400">
                    {entry.actorId._id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Card className="overflow-hidden border-2 border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900/95">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-slate-600 dark:text-slate-400" />
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Request</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  IP
                </span>
                <p className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">{entry.ip ?? '—'}</p>
              </div>
              <div className="space-y-2 col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  User-Agent
                </span>
                <p className="text-sm font-mono break-all text-slate-800 dark:text-slate-200">
                  {entry.userAgent ?? '—'}
                </p>
              </div>
              <div className="space-y-2 col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  Request ID
                </span>
                <p className="text-sm font-mono break-all text-slate-600 dark:text-slate-400">
                  {entry.requestId ?? '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {metadataEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <Card className="overflow-hidden border-2 border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900/95">
            <CardHeader className="pb-2 pt-6 px-6">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-600 dark:text-slate-400" />
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Metadata</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 p-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {metadataEntries.map(({ key, value }) => (
                    <div key={key} className="space-y-1">
                      <dt className="text-[10px] font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400">
                        {key}
                      </dt>
                      <dd className="text-sm font-mono break-all text-slate-900 dark:text-slate-100">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
