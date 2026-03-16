import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api-server';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';

export default async function ProtectedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  return (
    <ProtectedLayout serverUser={session.user}>
      {children}
    </ProtectedLayout>
  );
}
