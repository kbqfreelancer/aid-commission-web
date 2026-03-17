'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/index';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { Logo } from '@/components/ui/logo';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

const flipItems = [
  'Track human rights indicators across facilities',
  'Collect and report national HIV data',
  'Monitor compliance with age, sex, and violation breakdowns',
  'Support supervisors and data entry officers',
];

const FLIP_INTERVAL_MS = 4000;

function LoginFlipItem({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, rotateX: 75, y: 10 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, rotateX: -75, y: -10 }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-sm text-foreground leading-relaxed origin-center font-medium"
      style={{ backfaceVisibility: 'hidden' } as React.CSSProperties}
    >
      {text}
    </motion.p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flipIndex, setFlipIndex] = useState(0);
  const [flipProgress, setFlipProgress] = useState(0);

  useEffect(() => {
    setFlipProgress(0);
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / FLIP_INTERVAL_MS, 1);
      setFlipProgress(p);
      if (p < 1) requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [flipIndex]);

  useEffect(() => {
    const id = setInterval(() => {
      setFlipIndex((i) => (i + 1) % flipItems.length);
    }, FLIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

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
      const { user } = json.data;
      setAuth(user);
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
      <div className="hidden lg:flex flex-col w-[45%] relative bg-brand-dark border-r border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, rgba(3,140,51,0.1) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-0 right-0 w-px h-full bg-linear-to-b from-transparent via-brand-gold/20 to-transparent" />
        <div className="absolute bottom-1/3 left-8 right-8 h-px bg-linear-to-r from-transparent via-brand-gold/15 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between h-full p-14">
          <div className="flex items-center">
            <Logo />
            <div>
              <p className="font-display text-base text-foreground">NHIDRS</p>
              <p className="text-xs font-mono text-muted-foreground">National HIV & Human Rights Data Reporting System</p>
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
              className="mt-8 min-h-[100px]"
            >
              <div className="group relative overflow-hidden rounded-xl border border-brand-gold/25 bg-brand-gold/5 p-5 transition-colors hover:border-brand-gold/35 hover:bg-brand-gold/8 perspective-normal">
                <div className="absolute inset-0 bg-linear-to-br from-brand-gold/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-brand-gold/90 mb-3">
                  What NHIDRS does
                </p>
                <div className="min-h-10 flex items-center">
                  <AnimatePresence mode="wait">
                    <LoginFlipItem key={flipIndex} text={flipItems[flipIndex]} />
                  </AnimatePresence>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  {flipItems.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFlipIndex(i)}
                      className="h-1.5 flex-1 min-w-0 overflow-hidden rounded-full bg-border/80 cursor-pointer transition-colors hover:bg-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:ring-offset-2 focus:ring-offset-transparent"
                      aria-label={`Go to slide ${i + 1}`}
                    >
                      <motion.span
                        className="block h-full rounded-full bg-brand-gold/70"
                        initial={false}
                        animate={{
                          width: i === flipIndex ? `${flipProgress * 100}%` : i < flipIndex ? '100%' : '0%',
                        }}
                        transition={{ duration: 0.15 }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <p className="text-[10px] font-mono text-muted-foreground/60">
            © {new Date().getFullYear()} National HIV Programme
          </p>
        </div>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-[#f0fdf4]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-brand-black" />
            </div>
            <p className="font-display text-lg text-gray-900">NHIDRS</p>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl text-gray-900 mb-1">Sign in</h1>
            <p className="text-sm text-gray-600">
              Enter your credentials to access the platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@organisation.org"
                className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-brand-green/50 focus-visible:border-brand-green/50"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-brand-green/50 focus-visible:border-brand-green/50"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-brand-green hover:bg-[#027a2d] text-white shadow-md hover:shadow-lg transition-shadow" loading={loading}>
              {!loading && (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-white/80 border border-gray-200/80 rounded-xl border-l-4 border-l-brand-green shadow-sm">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
              Demo credentials
            </p>
            {[
              { role: 'Admin', email: 'admin@pudhr.org', pw: 'Admin1234!' },
              { role: 'Supervisor', email: 'supervisor@pudhr.org', pw: 'Super1234!' },
              { role: 'Officer', email: 'officer@pudhr.org', pw: 'Officer1234!' },
            ].map((c) => (
              <div key={c.role} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-gray-600">{c.role}</span>
                <span className="font-mono text-gray-800">{c.email}</span>
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
