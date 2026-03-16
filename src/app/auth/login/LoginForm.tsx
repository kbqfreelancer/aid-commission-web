'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/index';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.message ?? 'Login failed';
        toast.error(msg);
        return;
      }
      const { user, accessToken, refreshToken } = json.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name}`);
      router.replace(redirectTo);
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Decorative left panel */}
      <div className="hidden lg:flex flex-col w-[45%] relative bg-navy-950 border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(249,138,7,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-amber-500/20 to-transparent" />
        <div className="absolute bottom-1/3 left-8 right-8 h-px bg-linear-to-r from-transparent via-amber-500/15 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-navy-950" />
            </div>
            <div>
              <p className="font-display text-base text-foreground">PUD HR System</p>
              <p className="text-xs font-mono text-muted-foreground">National Data Platform</p>
            </div>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-4xl text-foreground leading-tight mb-4"
            >
              Human Rights
              <br />
              <span className="text-gradient">Indicator System</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-muted-foreground leading-relaxed max-w-sm"
            >
              National HIV Data Collection platform for tracking human rights indicators across
              state agencies and health facilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Indicators', value: '4+' },
                { label: 'Breakdowns', value: 'Dynamic' },
                { label: 'Roles', value: '3' },
              ].map((s) => (
                <div key={s.label} className="border border-border/50 rounded-lg p-3">
                  <p className="font-display text-xl text-amber-400">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground/60">
            © {new Date().getFullYear()} National HIV Programme · Confidential
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-navy-950" />
            </div>
            <p className="font-display text-lg text-foreground">PUD HR System</p>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl text-foreground mb-1">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@organisation.org"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-9"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              {!loading && (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-secondary/40 border border-border rounded-md">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Demo credentials
            </p>
            {[
              { role: 'Admin', email: 'admin@pudhr.org', pw: 'Admin1234!' },
              { role: 'Supervisor', email: 'supervisor@pudhr.org', pw: 'Super1234!' },
              { role: 'Officer', email: 'officer@pudhr.org', pw: 'Officer1234!' },
            ].map((c) => (
              <div key={c.role} className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground">{c.role}</span>
                <span className="font-mono text-foreground/70">{c.email}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-6">
            No account?{' '}
            <Link
              href="/auth/register"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
