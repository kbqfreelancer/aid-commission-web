import { Suspense } from 'react';
import { getIndicators, getNationalSummary, getOrgSummary, getReports } from '@/lib/data';
import { DashboardClient } from './DashboardClient';
import { PageSkeleton, SkeletonCard } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function DashboardSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch min-h-[150px]">
        {[0, 50, 100, 150].map((delay, i) => (
          <SkeletonCard key={i} delay={delay} className="h-full min-h-[120px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton delay={200} rounded="xl" className="h-64 lg:col-span-2 border border-border/50" />
        <Skeleton delay={250} rounded="xl" className="h-64 border border-border/50" />
        <Skeleton delay={300} rounded="xl" className="h-48 lg:col-span-3 border border-border/50" />
      </div>
    </PageSkeleton>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; quarter?: string }>;
}) {
  const { year: yParam, quarter: qParam } = await searchParams;
  const year = yParam ? Number(yParam) : new Date().getFullYear();
  const quarter = qParam ?? '';

  const [indicators, national, orgRows, reportsData] = await Promise.all([
    getIndicators(),
    getNationalSummary(year, quarter || undefined),
    getOrgSummary(year, quarter || undefined),
    getReports(year, 50, quarter || undefined, undefined, undefined, undefined),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        initialData={{
          indicators,
          national,
          orgRows,
          reports: reportsData.reports,
        }}
        year={year}
        quarter={quarter}
      />
    </Suspense>
  );
}
