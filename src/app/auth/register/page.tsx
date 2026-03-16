import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api-server';
import { RegisterForm } from './RegisterForm';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect('/dashboard');

  return <RegisterForm />;
}
