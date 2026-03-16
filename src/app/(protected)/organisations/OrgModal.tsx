'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/index';
import { useCreateOrg, useUpdateOrg } from '@/hooks/useApi';
import { toast } from 'sonner';
import type { Organisation } from '@/types';

type OrgModalProps = {
  org?: Organisation;
  onClose: () => void;
  onSuccess: () => void;
};

type OrgFormState = {
  name: string;
  region: string;
  district: string;
  contactPerson: string;
  contactEmail: string;
};

const REQUIRED_FIELDS: Array<keyof OrgFormState> = ['name', 'region', 'district'];

export function OrgModal({ org, onClose, onSuccess }: OrgModalProps) {
  const createOrg = useCreateOrg();
  const updateOrg = useUpdateOrg();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OrgFormState>({
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
    placeholder,
  }: {
    label: string;
    name: keyof OrgFormState;
    type?: string;
    placeholder?: string;
  }) => {
    const isRequired = REQUIRED_FIELDS.includes(name);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label
            htmlFor={name}
            className="text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
            {isRequired && <span className="ml-0.5 text-red-500">*</span>}
          </Label>
        </div>
        <Input
          id={name}
          type={type}
          value={form[name]}
          onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
          required={isRequired}
          placeholder={placeholder}
          className="h-9 rounded-md border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-card"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-white p-6 text-slate-900 shadow-2xl dark:bg-card dark:text-foreground"
      >
        <div className="mb-5 space-y-1">
          <h2 className="font-display text-lg">
            {org ? 'Edit organisation' : 'New organisation'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provide key details about the organisation. Fields marked with
            <span className="mx-1 text-red-500">*</span>
            are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Field
              label="Organisation name"
              name="name"
              placeholder="e.g. Eastern Provincial Health Directorate"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Region" name="region" placeholder="e.g. Eastern" />
              <Field label="District" name="district" placeholder="e.g. Kono" />
            </div>
          </div>

          <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-muted/40">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Contact details
            </p>
            <div className="space-y-3">
              <Field
                label="Contact person"
                name="contactPerson"
                placeholder="e.g. Dr. Mariatu Kamara"
              />
              <Field
                label="Contact email"
                name="contactEmail"
                type="email"
                placeholder="e.g. mariatu.kamara@example.gov"
              />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-1">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              You can update these details later from the organisations list.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="h-9 px-3">
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                {org ? 'Save changes' : 'Create organisation'}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

