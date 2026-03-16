'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Building2, Activity, Settings, UserPlus, FileText, Layers, ChevronRight, ScrollText } from 'lucide-react';
import Link from 'next/link';
import { useHeader } from '@/components/layout/HeaderContext';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/KpiCard';
import { HEADER_PRIMARY_CLASS } from '@/components/layout/headerStyles';
import { Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { toast } from 'sonner';
import type { Organisation, IndicatorDefinition } from '@/types';

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'data_entry' | 'supervisor' | 'admin'>('data_entry');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organisation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
          organisation: form.organisation || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json?.message ?? 'Failed to create user');
        return;
      }
      toast.success('Account created – user can now sign in');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    name,
    type = 'text',
    required,
  }: {
    label: string;
    name: keyof typeof form;
    type?: string;
    required?: boolean;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</Label>
      <Input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        required={required}
        className="h-9 rounded-md border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-card"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-white p-6 text-slate-900 shadow-2xl dark:bg-card dark:text-foreground"
      >
        <div className="mb-5 space-y-1">
          <h2 className="font-display text-lg">Create user</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a new user account. They can sign in immediately after.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Field label="Full name *" name="name" required />
            <Field label="Email address *" name="email" type="email" required />
            <Field label="Password *" name="password" type="password" required />
          </div>
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-muted/40">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Role & Organisation
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">Role *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                  <SelectTrigger className="h-9 rounded-md border-slate-200 bg-white dark:border-border dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data_entry">Data Entry Officer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="Organisation (optional)" name="organisation" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 px-3">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
              Create user
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function AdminClient({
  orgs,
  reportsMeta,
  indicators,
}: {
  orgs: Organisation[];
  reportsMeta: { total: number } | null;
  indicators: IndicatorDefinition[];
}) {
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const totalReports = reportsMeta?.total ?? '—';

  const yourSessionItems = serverUser
    ? [
        { label: 'User', value: serverUser.name },
        { label: 'Email', value: serverUser.email },
        { label: 'Role', value: serverUser.role },
        { label: 'Account ID', value: serverUser._id },
      ]
    : [];

  useEffect(() => {
    setHeader({
      title: 'Admin Panel',
      description: 'System administration and configuration',
      actions: (
        <Button
          size="sm"
          onClick={() => setCreateUserOpen(true)}
          className={HEADER_PRIMARY_CLASS}
        >
          <UserPlus size={14} /> Create user
        </Button>
      ),
    });
    return clearHeader;
  }, [setHeader, clearHeader]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch min-h-[120px]">
        <KpiCard
          icon={Building2}
          label="Organisations"
          value={orgs?.length ?? 0}
          sub="Active reporting organisations"
          manageHref="/organisations"
          delay={0}
          accentKey="primary"
        />
        <KpiCard
          icon={Users}
          label="Total Reports"
          value={totalReports}
          sub="All reports in the system"
          manageHref="/reports"
          delay={0.05}
          accentKey="gold"
        />
        <KpiCard
          icon={Activity}
          label="Indicators"
          value={indicators?.length ?? '…'}
          sub="In the dynamic registry"
          manageHref="/indicators"
          delay={0.1}
          accentKey="blue"
        />
        <KpiCard
          icon={Settings}
          label="Pending"
          value="—"
          sub="Submitted awaiting review"
          manageHref="/reports"
          delay={0.15}
          accentKey="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="h-full rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
            <CardHeader className="pb-2 pt-6 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-foreground">Your Session</CardTitle>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-gray-100 dark:divide-border">
                {yourSessionItems.length === 0 ? (
                  <p className="py-4 text-xs text-gray-500 dark:text-muted-foreground">No session data</p>
                ) : (
                  yourSessionItems.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 gap-4">
                      <span className="text-xs text-gray-500 shrink-0 dark:text-muted-foreground">{label}</span>
                      <span className="text-xs font-mono text-gray-900 text-right truncate dark:text-foreground">
                        {value}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.27, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="rounded-2xl bg-white border border-gray-200 shadow-md overflow-hidden transition-shadow hover:shadow-lg dark:border-border dark:bg-card">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-foreground">Quick Actions</CardTitle>
              <p className="text-sm text-gray-600 mt-1 dark:text-muted-foreground">
                Common administrative tasks
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  onClick={() => setCreateUserOpen(true)}
                  className="group flex flex-col items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200/60 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all duration-200 text-left dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:hover:bg-emerald-500/20 dark:hover:border-emerald-500/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                    <UserPlus size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Create user</p>
                    <p className="text-xs text-emerald-700/80 dark:text-emerald-200/70 mt-0.5">Add a new account</p>
                  </div>
                </motion.button>
                {[
                  { label: 'Add Organisation', href: '/organisations', icon: Building2, desc: 'Register a facility' },
                  { label: 'View Reports', href: '/reports', icon: Activity, desc: 'Browse submissions' },
                  { label: 'New Report', href: '/reports/new', icon: FileText, desc: 'Create HR report' },
                  { label: 'Indicator Registry', href: '/indicators', icon: Layers, desc: 'View definitions' },
                  { label: 'Audit Trails', href: '/admin/audit-logs', icon: ScrollText, desc: 'View audit logs' },
                ].map(({ label, href, icon: Icon, desc }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.38 + i * 0.05, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <Link
                      href={href}
                      className="group flex flex-col items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:bg-white hover:border-amber-300 hover:shadow-md transition-all duration-200 dark:bg-muted/40 dark:border-border dark:hover:bg-card dark:hover:border-amber-500/40"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 group-hover:scale-105 transition-transform">
                          <Icon size={18} strokeWidth={2} />
                        </div>
                        <ChevronRight size={14} className="text-gray-400 group-hover:text-amber-500 shrink-0 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-foreground">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </div>
        </motion.div>
      </div>

      {createUserOpen && (
        <CreateUserModal
          onClose={() => setCreateUserOpen(false)}
          onSuccess={() => setCreateUserOpen(false)}
        />
      )}
    </>
  );
}
