import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getIndicators, getNationalSummary, getOrgSummary, getReports } from '@/lib/data';
import { DashboardClient } from './DashboardClient';
import { Skeleton } from '@/components/ui/index';

function DashboardSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48 lg:col-span-3" />
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; quarter?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

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
        serverUser={session.user}
      />
    </Suspense>
  );
}
