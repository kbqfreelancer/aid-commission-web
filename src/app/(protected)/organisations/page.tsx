import { Suspense } from 'react';
import { getOrganisations } from '@/lib/data';
import { OrganisationsClient } from './OrganisationsClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function OrganisationsSkeleton() {
  return (
    <PageSkeleton>
      <div className="max-w-sm mb-5">
        <Skeleton delay={0} className="h-9 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} delay={i * 60} rounded="xl" className="h-36 border border-border/50" />
        ))}
      </div>
    </PageSkeleton>
  );
}

export default async function OrganisationsPage() {
  const orgs = await getOrganisations();

  return (
    <Suspense fallback={<OrganisationsSkeleton />}>
      <OrganisationsClient orgs={orgs} />
    </Suspense>
  );
}
