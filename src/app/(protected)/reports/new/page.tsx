import { Suspense } from 'react';
import { getIndicators, getOrganisations } from '@/lib/data';
import { NewReportClient } from './NewReportClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function NewReportSkeleton() {
  return (
    <PageSkeleton>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton delay={0} rounded="xl" className="h-96 border border-border/50" />
        <Skeleton delay={80} rounded="xl" className="h-64 lg:col-span-2 border border-border/50" />
      </div>
    </PageSkeleton>
  );
}

export default async function NewReportPage() {
  const [indicators, orgs] = await Promise.all([
    getIndicators(),
    getOrganisations(),
  ]);

  return (
    <Suspense fallback={<NewReportSkeleton />}>
      <NewReportClient
        indicators={indicators}
        orgs={orgs}
      />
    </Suspense>
  );
}
