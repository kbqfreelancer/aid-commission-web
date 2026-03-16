import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getOrganisations } from '@/lib/data';
import { OrganisationsClient } from './OrganisationsClient';
import { Skeleton } from '@/components/ui/index';

function OrganisationsSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="max-w-sm mb-5">
          <Skeleton className="h-9" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function OrganisationsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const orgs = await getOrganisations();

  return (
    <Suspense fallback={<OrganisationsSkeleton />}>
      <OrganisationsClient orgs={orgs} serverUser={session.user} />
    </Suspense>
  );
}
