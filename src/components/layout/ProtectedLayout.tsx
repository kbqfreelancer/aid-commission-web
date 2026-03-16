'use client';

import { HeaderProvider } from './HeaderContext';
import { ServerUserProvider } from './ServerUserContext';
import { AppShell } from './AppShell';
import type { User } from '@/types';

interface ProtectedLayoutProps {
  serverUser: User;
  children: React.ReactNode;
}

export function ProtectedLayout({ serverUser, children }: ProtectedLayoutProps) {
  return (
    <ServerUserProvider user={serverUser}>
      <HeaderProvider>
        <AppShell serverUser={serverUser}>
          {children}
        </AppShell>
      </HeaderProvider>
    </ServerUserProvider>
  );
}
