import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getReports, getOrganisations } from '@/lib/data';
import { ReportsClient } from './ReportsClient';
import { Skeleton } from '@/components/ui/index';

const CURRENT_YEAR = new Date().getFullYear();

function ReportsSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <Skeleton className="h-12 w-full mb-5" />
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; org?: string; year?: string; quarter?: string; status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/auth/login');

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
        serverUser={session.user}
      />
    </Suspense>
  );
}
