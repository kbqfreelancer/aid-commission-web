'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, Building2, Settings, LogOut, ChevronLeft, ChevronRight, Shield, Activity, ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebar } from './SidebarContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/reports',       label: 'Reports',       icon: FileText },
  { href: '/organisations', label: 'Organisations',  icon: Building2 },
  { href: '/indicators',    label: 'Indicators',     icon: Activity },
];
const adminItems = [
  { href: '/admin', label: 'Admin Config', icon: Settings },
  { href: '/admin/audit-logs', label: 'Audit Trails', icon: ScrollText },
];

export function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, logout } = useAuthStore();
  const { collapsed, setCollapsed } = useSidebar();

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  const NavLink = ({ href, label, icon: Icon }: typeof navItems[0]) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    const linkContent = (
      <Link href={href} className={cn(
        'group flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
        active
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
      )}>
        <Icon size={16} className={cn('shrink-0', active ? 'text-amber-400' : 'text-muted-foreground group-hover:text-foreground')} />
        {!collapsed && (
          <>
            <span className="flex-1">{label}</span>
            {active && <ChevronRight size={12} className="text-amber-400 opacity-60" />}
          </>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
        </Tooltip>
      );
    }
    return linkContent;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-30 flex flex-col border-r border-border bg-card overflow-hidden shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('border-b border-border flex shrink-0', collapsed ? 'px-0 py-5 justify-center' : 'px-4 py-5')}>
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-navy-950" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display text-sm font-semibold leading-tight text-foreground">NHIDRS</p>
              <p className="text-[10px] text-muted-foreground leading-tight font-mono">National HIV & Human Rights Data Reporting System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mb-2">Navigation</p>
        )}
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}

        {user?.role === 'admin' && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mt-4 mb-2">Admin</p>
            )}
            {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* Footer: collapse + logout */}
      <div className={cn('border-t border-border flex shrink-0 flex-col', collapsed ? 'px-0 py-3' : 'px-3 py-3')}>
        {/* Collapse toggle */}
        <div className={cn('flex', collapsed ? 'justify-center' : '')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  'rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/80',
                  collapsed ? 'h-8 w-8' : 'w-full justify-start gap-2 px-3 h-8'
                )}
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                {!collapsed && <span className="text-xs">Collapse</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className={cn('my-2 h-px bg-border', collapsed ? 'mx-2' : '')} />

        {/* User + Logout */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-mono font-semibold text-amber-400">
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Sign out</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <>
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
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
