'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Building2, BarChart3,
  Settings, LogOut, ChevronRight, Shield, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/reports',       label: 'Reports',       icon: FileText },
  { href: '/organisations', label: 'Organisations',  icon: Building2 },
  { href: '/indicators',    label: 'Indicators',     icon: Activity },
];
const adminItems = [
  { href: '/admin', label: 'Admin Config', icon: Settings },
];

export function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const NavLink = ({ href, label, icon: Icon }: typeof navItems[0]) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link href={href} className={cn(
        'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150',
        active
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}>
        <Icon size={16} className={cn('shrink-0', active ? 'text-amber-400' : 'text-muted-foreground group-hover:text-foreground')} />
        <span className="flex-1">{label}</span>
        {active && <ChevronRight size={12} className="text-amber-400 opacity-60" />}
      </Link>
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 bottom-0 w-60 z-30 flex flex-col border-r border-border bg-card"
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-navy-950" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight text-foreground">PUD HR</p>
            <p className="text-[10px] text-muted-foreground leading-tight font-mono">National Data System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mb-2">Navigation</p>
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}

        {user?.role === 'admin' && (
          <>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mt-4 mb-2">Admin</p>
            {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* User block */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-secondary/50 mb-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-mono font-semibold text-amber-400">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name ?? 'Loading…'}</p>
            <p className="text-[10px] font-mono text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </motion.aside>
  );
}
