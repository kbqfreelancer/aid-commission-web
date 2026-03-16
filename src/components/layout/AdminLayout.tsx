'use client';
import { Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/index';
import type { User } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
  serverUser: User;
}

export function AdminLayout({ children, serverUser }: AdminLayoutProps) {
  return (
    <AppShell
      serverUser={serverUser}
      title="Admin Panel"
      description="System administration and configuration"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="admin" className="text-xs">
            <Shield size={10} /> Admin
          </Badge>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
