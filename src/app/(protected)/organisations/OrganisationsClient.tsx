'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Plus, Building2, MapPin, Mail, Phone, Pencil, PowerOff, Search, X } from 'lucide-react';
import { useHeader } from '@/components/layout/HeaderContext';
import { HEADER_PRIMARY_CLASS } from '@/components/layout/headerStyles';
import { useServerUser } from '@/components/layout/ServerUserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/index';
import { useDeactivateOrg } from '@/hooks/useApi';
import { toast } from 'sonner';
import type { Organisation } from '@/types';
import { OrgModal } from './OrgModal';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
    >
      <Card className="group flex flex-col border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:border-amber-400/60 hover:shadow-md dark:border-border dark:bg-card">
        <CardContent className="flex flex-1 flex-col gap-4 p-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
                <Building2 size={15} />
              </div>
              <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-foreground">
                {org.name}
              </h3>
            </div>
            {isAdmin && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onEdit(org)}
                  title="Edit organisation"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onDeactivate(org)}
                  title="Deactivate organisation"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <PowerOff size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Location badge */}
          <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 dark:bg-muted/40">
            <MapPin size={11} className="shrink-0 text-slate-400" />
            <span className="truncate text-xs text-slate-600 dark:text-muted-foreground">
              {org.region} &mdash; {org.district}
            </span>
          </div>

          {/* Contact details */}
          {(org.contactPerson || org.contactEmail) && (
            <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-border">
              {org.contactPerson && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground">
                  <Phone size={11} className="shrink-0" />
                  <span className="truncate">{org.contactPerson}</span>
                </div>
              )}
              {org.contactEmail && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground">
                  <Mail size={11} className="shrink-0" />
                  <a
                    href={`mailto:${org.contactEmail}`}
                    className="truncate transition-colors hover:text-amber-500"
                  >
                    {org.contactEmail}
                  </a>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}

export function OrganisationsClient({
  orgs,
}: {
  orgs: Organisation[];
}) {
  const router = useRouter();
  const { setHeader, clearHeader } = useHeader();
  const serverUser = useServerUser();
  const deactivateOrg = useDeactivateOrg();
  const isAdmin = serverUser?.role === 'admin';
  const [modal, setModal] = useState<'new' | Organisation | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setHeader({
      title: 'Organisations',
      description: 'State agencies and health facilities registered in the system',
      actions: isAdmin ? (
        <Button size="sm" onClick={() => setModal('new')} className={HEADER_PRIMARY_CLASS}>
          <Plus size={14} /> Add Organisation
        </Button>
      ) : undefined,
    });
    return clearHeader;
  }, [setHeader, clearHeader, isAdmin]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 180);

    return () => window.clearTimeout(id);
  }, [searchInput]);

  const filtered =
    orgs?.filter(
      (o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.region.toLowerCase().includes(search.toLowerCase()) ||
        o.district.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleDeactivate = (org: Organisation) => {
    toast(`Deactivate "${org.name}"?`, {
      description: 'This organisation will be marked as inactive and hidden from active lists.',
      duration: 8000,
      classNames: {
        toast: '!bg-red-600 !border-red-700 !text-white',
        title: '!text-white !font-semibold',
        description: '!text-red-100',
        actionButton: '!bg-white !text-red-600 !font-medium hover:!bg-red-50',
        cancelButton: '!bg-red-700 !text-red-100 hover:!bg-red-800',
      },
      action: {
        label: 'Deactivate',
        onClick: async () => {
          try {
            await deactivateOrg.mutateAsync(org._id);
            toast.success(`"${org.name}" has been deactivated.`);
            router.refresh();
          } catch {
            toast.error('Failed to deactivate organisation. Please try again.');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleModalSuccess = () => {
    router.refresh();
  };

  return (
    <>
      {/* Search bar */}
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search by name, region or district…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 rounded-lg border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:border-border dark:bg-background dark:text-foreground"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600 dark:hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <span className="shrink-0 text-xs text-slate-400 dark:text-muted-foreground">
          {orgs?.length ?? 0} total
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center dark:border-border/60 dark:bg-muted/40">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-400 dark:bg-amber-500/10 dark:text-amber-500">
            <Building2 size={22} />
          </div>
          <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-foreground">
            No organisations found
          </p>
          <p className="max-w-xs text-xs text-slate-500 dark:text-muted-foreground">
            {search
              ? `No results for "${search}". Try a different name, region, or district.`
              : 'No organisations have been registered yet.'}
          </p>
          {isAdmin && (
            <Button
              size="sm"
              className="mt-5 rounded-lg bg-emerald-600 text-xs text-white shadow-md hover:bg-emerald-700 hover:shadow-lg"
              onClick={() => setModal('new')}
            >
              <Plus size={14} className="mr-1.5" />
              Add organisation
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-muted-foreground">
              Showing{' '}
              <span className="font-medium text-slate-700 dark:text-foreground">
                {filtered.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-slate-700 dark:text-foreground">
                {orgs?.length ?? 0}
              </span>{' '}
              organisation{orgs?.length !== 1 ? 's' : ''}
            </span>
            {search && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-border dark:bg-muted dark:hover:text-foreground"
              >
                <X size={10} />
                Clear search
              </button>
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
    </>
  );
}
