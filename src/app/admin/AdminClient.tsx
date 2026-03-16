'use client';
import { motion } from 'motion/react';
import { Shield, Users, Building2, Activity, Database, Settings } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/index';
import type { User, Organisation, IndicatorDefinition } from '@/types';

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
  const totalReports = reportsMeta?.total ?? '—';

  const configSections = [
    {
      key: 'System Info',
      icon: Database,
      items: [
        { label: 'API Base', value: 'https://aid-commission-backend-api.onrender.com/api/v1' },
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
    </AppShell>
  );
}
