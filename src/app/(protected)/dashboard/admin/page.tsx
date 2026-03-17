import { Suspense } from 'react';
import { getOrganisations, getReports, getIndicators } from '@/lib/data';
import { AdminClient } from './AdminClient';
import { PageSkeleton, SkeletonCard } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function AdminSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch min-h-[120px]">
        {[0, 50, 100, 150].map((delay, i) => (
          <SkeletonCard key={i} delay={delay} className="h-full min-h-[120px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton delay={200} rounded="xl" className="h-48 border border-border/50" />
        <Skeleton delay={250} rounded="xl" className="h-48 border border-border/50" />
      </div>
    </PageSkeleton>
  );
}

export default async function AdminPage() {
  const [orgs, reportsData, indicators] = await Promise.all([
    getOrganisations(),
    getReports(new Date().getFullYear(), 1, undefined, undefined, undefined, undefined),
    getIndicators(),
  ]);

  return (
    <Suspense fallback={<AdminSkeleton />}>
      <AdminClient
        orgs={orgs}
        reportsMeta={reportsData.meta ?? null}
        indicators={indicators}
      />
    </Suspense>
  );
}
