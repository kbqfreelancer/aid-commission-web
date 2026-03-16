'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Building2, Activity, Database, Settings, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/index';
import { toast } from 'sonner';
import type { User, Organisation, IndicatorDefinition } from '@/types';

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
      <Label>{label}</Label>
      <Input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        required={required}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6"
      >
        <h2 className="font-display text-lg mb-5">Create user</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Full name *" name="name" required />
          <Field label="Email address *" name="email" type="email" required />
          <Field label="Password *" name="password" type="password" required />
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
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
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create user
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AdminStatCard({
  icon: Icon,
  label,
  value,
  description,
  href,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  description: string;
  href?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="stat-card hover:border-amber-500/20 transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Icon size={15} className="text-amber-400" />
            </div>
            {href && (
              <Button variant="ghost" size="sm" asChild className="text-xs h-7">
                <Link href={href}>Manage →</Link>
              </Button>
            )}
          </div>
          <p className="font-display text-2xl text-foreground mb-0.5">{value}</p>
          <p className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AdminClient({
  orgs,
  reportsMeta,
  indicators,
  serverUser,
}: {
  orgs: Organisation[];
  reportsMeta: { total: number } | null;
  indicators: IndicatorDefinition[];
  serverUser: User;
}) {
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const totalReports = reportsMeta?.total ?? '—';

  const configSections = [
    {
      key: 'System Info',
      icon: Database,
      items: [
        { label: 'API Base', value: process.env.NEXT_PUBLIC_API_BASE ?? 'https://aid-commission-backend-api.onrender.com/api/v1' },
        { label: 'Indicator Registry', value: `${indicators?.length ?? '?'} indicators` },
        { label: 'Database', value: 'MongoDB Atlas' },
      ],
    },
    {
      key: 'Your Session',
      icon: Shield,
      items: [
        { label: 'User', value: serverUser.name },
        { label: 'Email', value: serverUser.email },
        { label: 'Role', value: serverUser.role },
        { label: 'Account ID', value: serverUser._id },
      ],
    },
  ];

  return (
    <AppShell
      serverUser={serverUser}
      title="Admin Panel"
      description="System administration and configuration"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="admin" className="text-xs">
            <Shield size={10} /> Admin
          </Badge>
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          icon={Building2}
          label="Organisations"
          value={orgs?.length ?? 0}
          description="Active reporting organisations"
          href="/organisations"
          delay={0}
        />
        <AdminStatCard
          icon={Users}
          label="Total Reports"
          value={totalReports}
          description="All reports in the system"
          href="/reports"
          delay={0.06}
        />
        <AdminStatCard
          icon={Activity}
          label="Indicators"
          value={indicators?.length ?? '…'}
          description="In the dynamic registry"
          href="/indicators"
          delay={0.12}
        />
        <AdminStatCard
          icon={Settings}
          label="Pending"
          value="—"
          description="Submitted awaiting review"
          href="/reports"
          delay={0.18}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {configSections.map((section, si) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + si * 0.07 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <section.icon size={14} className="text-amber-400" />
                  <CardTitle className="text-sm">{section.key}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/60">
                  {section.items.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 gap-4">
                      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                      <span className="text-xs font-mono text-foreground text-right truncate">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => setCreateUserOpen(true)}
                >
                  <UserPlus size={16} className="text-amber-400" />
                  <span className="text-xs">Create user</span>
                </Button>
                {[
                  { label: 'Add Organisation', href: '/organisations', icon: Building2 },
                  { label: 'View Reports', href: '/reports', icon: Activity },
                  { label: 'New Report', href: '/reports/new', icon: Database },
                  { label: 'Indicator Registry', href: '/indicators', icon: Settings },
                ].map(({ label, href, icon: Icon }) => (
                  <Button
                    key={label}
                    variant="outline"
                    asChild
                    className="h-auto flex-col gap-2 py-4"
                  >
                    <Link href={href}>
                      <Icon size={16} className="text-amber-400" />
                      <span className="text-xs">{label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {createUserOpen && (
        <CreateUserModal
          onClose={() => setCreateUserOpen(false)}
          onSuccess={() => setCreateUserOpen(false)}
        />
      )}
    </AppShell>
  );
}
