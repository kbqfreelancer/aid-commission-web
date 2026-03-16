import { Suspense } from 'react';
import { getReports, getOrganisations } from '@/lib/data';
import { ReportsClient } from './ReportsClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

const CURRENT_YEAR = new Date().getFullYear();

function ReportsSkeleton() {
  return (
    <PageSkeleton>
      <Skeleton delay={0} className="h-10 w-full mb-5 rounded-lg" />
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <Skeleton delay={i * 40} className="h-4 w-36 rounded" />
              <Skeleton delay={i * 40 + 10} className="h-4 w-20 rounded" />
              <Skeleton delay={i * 40 + 20} className="h-4 w-16 rounded" />
              <Skeleton delay={i * 40 + 30} className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    </PageSkeleton>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; org?: string; year?: string; quarter?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? Number(params.page) : 1;
  const year = params.year ? Number(params.year) : CURRENT_YEAR;
  const quarter = params.quarter || undefined;
  const organisation = params.org || undefined;
  const status = params.status || undefined;

  const [reportsData, orgs] = await Promise.all([
    getReports(year, 20, quarter, organisation, status, page),
    getOrganisations(),
  ]);

  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsClient
        reports={reportsData.reports}
        orgs={orgs}
        meta={reportsData.meta}
      />
    </Suspense>
  );
}
