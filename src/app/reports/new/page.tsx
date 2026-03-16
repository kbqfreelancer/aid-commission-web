import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getIndicators, getOrganisations } from '@/lib/data';
import { NewReportClient } from './NewReportClient';
import { Skeleton } from '@/components/ui/index';

function NewReportSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-96" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}

export default async function NewReportPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const [indicators, orgs] = await Promise.all([
    getIndicators(),
    getOrganisations(),
  ]);

  return (
    <Suspense fallback={<NewReportSkeleton />}>
      <NewReportClient
        indicators={indicators}
        orgs={orgs}
        serverUser={session.user}
      />
    </Suspense>
  );
}
