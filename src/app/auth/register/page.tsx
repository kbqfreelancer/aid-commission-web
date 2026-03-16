import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api-server';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');
  redirect('/auth/login');
}
