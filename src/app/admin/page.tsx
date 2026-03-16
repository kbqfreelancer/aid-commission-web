import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getOrganisations, getReports, getIndicators } from '@/lib/data';
import { AdminClient } from './AdminClient';
import { Skeleton } from '@/components/ui/index';

function AdminSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) return null;

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
        serverUser={session.user}
      />
    </Suspense>
  );
}
