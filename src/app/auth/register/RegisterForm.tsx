'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/index';
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  role: z.enum(['data_entry', 'supervisor', 'admin']),
  organisation: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Form['role']>('data_entry');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'data_entry' },
  });

  const onSubmit = async (values: Form) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? 'Registration failed';
        toast.error(msg);
        return;
      }
      toast.success('Account created – please sign in');
      router.push('/auth/login');
    } catch {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-brand-black" />
          </div>
          <p className="font-display text-lg text-foreground">NHIDRS</p>
        </div>

        <h1 className="font-display text-2xl text-foreground mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Register to access the reporting platform
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field id="name" label="Full name" error={errors.name?.message}>
            <Input id="name" placeholder="Dr. Ama Ofori" {...register('name')} />
          </Field>
          <Field id="email" label="Email address" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="you@organisation.org"
              {...register('email')}
            />
          </Field>
          <Field id="password" label="Password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              {...register('password')}
            />
          </Field>

          <Field id="role" label="Role" error={errors.role?.message}>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v as Form['role']);
                setValue('role', v as Form['role']);
              }}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_entry">Data Entry Officer</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field id="organisation" label="Organisation (optional)" error={errors.organisation?.message}>
            <Input
              id="organisation"
              placeholder="Greater Accra Regional Health Service"
              {...register('organisation')}
            />
          </Field>

          <Button type="submit" className="w-full mt-2" loading={loading}>
            {!loading && (
              <>
                <span>Create account</span>
                <ArrowRight size={15} />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-brand-gold hover:text-brand-gold/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
