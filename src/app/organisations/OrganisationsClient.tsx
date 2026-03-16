'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Plus, Building2, MapPin, Mail, Phone, Pencil, PowerOff } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge, Input, Label } from '@/components/ui/index';
import { useCreateOrg, useUpdateOrg, useDeactivateOrg } from '@/hooks/useApi';
import { toast } from 'sonner';
import type { Organisation, User } from '@/types';

function OrgModal({
  org,
  onClose,
  onSuccess,
}: {
  org?: Organisation;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createOrg = useCreateOrg();
  const updateOrg = useUpdateOrg();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: org?.name ?? '',
    region: org?.region ?? '',
    district: org?.district ?? '',
    contactPerson: org?.contactPerson ?? '',
    contactEmail: org?.contactEmail ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (org) {
        await updateOrg.mutateAsync({ id: org._id, data: form });
      } else {
        await createOrg.mutateAsync(form);
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save organisation');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label,
    name,
    type = 'text',
  }: {
    label: string;
    name: keyof typeof form;
    type?: string;
  }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        required={['name', 'region', 'district'].includes(name)}
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
        <h2 className="font-display text-lg mb-5">
          {org ? 'Edit Organisation' : 'New Organisation'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Organisation name *" name="name" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region *" name="region" />
            <Field label="District *" name="district" />
          </div>
          <Field label="Contact person" name="contactPerson" />
          <Field label="Contact email" name="contactEmail" type="email" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {org ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function OrgCard({
  org,
  index,
  isAdmin,
  onEdit,
  onDeactivate,
}: {
  org: Organisation;
  index: number;
  isAdmin: boolean;
  onEdit: (o: Organisation) => void;
  onDeactivate: (o: Organisation) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group hover:border-amber-500/20 transition-all duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Building2 size={14} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground leading-tight truncate">
                {org.name}
              </h3>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(org)}>
                  <Pencil size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onDeactivate(org)}
                >
                  <PowerOff size={12} />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={11} />
              <span>
                {org.region} · {org.district}
              </span>
            </div>
            {org.contactPerson && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone size={11} />
                <span>{org.contactPerson}</span>
              </div>
            )}
            {org.contactEmail && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail size={11} />
                <a
                  href={`mailto:${org.contactEmail}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {org.contactEmail}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OrganisationsClient({
  orgs,
  serverUser,
}: {
  orgs: Organisation[];
  serverUser: User;
}) {
  const router = useRouter();
  const deactivateOrg = useDeactivateOrg();
  const isAdmin = serverUser?.role === 'admin';
  const [modal, setModal] = useState<'new' | Organisation | null>(null);
  const [search, setSearch] = useState('');

  const filtered =
    orgs?.filter(
      (o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.region.toLowerCase().includes(search.toLowerCase()) ||
        o.district.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleDeactivate = async (org: Organisation) => {
    if (!confirm(`Deactivate "${org.name}"?`)) return;
    try {
      await deactivateOrg.mutateAsync(org._id);
      router.refresh();
    } catch {
      /* toast from mutation onError */
    }
  };

  const handleModalSuccess = () => {
    router.refresh();
  };

  return (
    <AppShell
      serverUser={serverUser}
      title="Organisations"
      description="State agencies and health facilities registered in the system"
      actions={
        isAdmin && (
          <Button size="sm" onClick={() => setModal('new')}>
            <Plus size={14} /> Add Organisation
          </Button>
        )
      }
    >
      <div className="mb-5">
        <Input
          placeholder="Search organisations, regions, districts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm h-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No organisations found</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-mono text-muted-foreground">
              {filtered.length} organisation{filtered.length !== 1 ? 's' : ''}
            </span>
            {search && (
              <Badge variant="outline" className="text-[10px]">
                filtered
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((org, i) => (
              <OrgCard
                key={org._id}
                org={org}
                index={i}
                isAdmin={isAdmin}
                onEdit={(o) => setModal(o)}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        </>
      )}

      {modal && (
        <OrgModal
          org={modal === 'new' ? undefined : modal}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </AppShell>
  );
}
