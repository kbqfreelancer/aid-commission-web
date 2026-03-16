'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { useAuthStore } from '@/stores/auth.store';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { useContext } from 'react';
import { HeaderContext } from './HeaderContext';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /** Server-provided user for RSC pages; skips store check when present */
  serverUser?: User | null;
  contentClassName?: string;
  headerClassName?: string;
}

function AppShellInner({ children, title: titleProp, description: descProp, actions: actionsProp, serverUser, contentClassName, headerClassName }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const { collapsed } = useSidebar();
  const hasAuth = serverUser ? true : isAuthenticated();

  const headerCtx = useContext(HeaderContext);
  const contextHeader = headerCtx?.header ?? null;
  const title = titleProp ?? contextHeader?.title;
  const description = descProp ?? contextHeader?.description;
  const actions = actionsProp ?? contextHeader?.actions;

  useEffect(() => {
    if (serverUser) setUser(serverUser);
  }, [serverUser, setUser]);

  useEffect(() => {
    if (!hasAuth) router.replace('/auth/login');
  }, [hasAuth, router]);

  if (!hasAuth) return null;

  return (
    <div className="min-h-screen flex relative z-10">
      <Sidebar />
      <main className={cn('flex-1 min-h-screen flex flex-col transition-[margin] duration-200 ease-out', collapsed ? 'ml-16' : 'ml-60')}>
        {(title || actions) && (
          <header className={cn('sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm px-8 py-4 [&_h1]:text-gray-900 [&_p]:text-gray-700', headerClassName)}>
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                {title && (
                  <motion.h1
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-xl text-gray-900"
                  >
                    {title}
                  </motion.h1>
                )}
                {description && (
                  <p className="text-sm text-gray-600 mt-0.5">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 shrink-0 rounded-xl bg-gray-100 border border-gray-200 px-3 py-2">
                  {actions}
                </div>
              )}
            </div>
          </header>
        )}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('flex-1 px-8 py-6 min-h-full bg-green-50', contentClassName)}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner {...props} />
    </SidebarProvider>
  );
}
