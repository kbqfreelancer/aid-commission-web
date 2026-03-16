import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api-server';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  if (session.user.role !== 'admin') redirect('/dashboard');

  return (
    <AdminLayout serverUser={session.user}>
      {children}
    </AdminLayout>
  );
}
