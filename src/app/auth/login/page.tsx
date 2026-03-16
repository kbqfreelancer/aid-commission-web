import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api-server';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return <LoginForm />;
}
