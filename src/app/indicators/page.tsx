import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getIndicators } from '@/lib/data';
import { IndicatorsClient } from './IndicatorsClient';
import { Skeleton } from '@/components/ui/index';

function IndicatorsSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function IndicatorsPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const indicators = await getIndicators();

  return (
    <Suspense fallback={<IndicatorsSkeleton />}>
      <IndicatorsClient indicators={indicators} serverUser={session.user} />
    </Suspense>
  );
}
