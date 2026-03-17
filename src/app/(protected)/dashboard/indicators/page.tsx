import { Suspense } from 'react';
import { getIndicators } from '@/lib/data';
import { IndicatorsClient } from './IndicatorsClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function IndicatorsSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 items-stretch min-h-[120px]">
        {[0, 50, 100].map((delay, i) => (
          <Skeleton key={i} delay={delay} rounded="xl" className="h-full min-h-[120px] border border-border/50" />
        ))}
      </div>
      <div className="mb-6">
        <Skeleton delay={0} className="h-9 rounded-lg max-w-sm" />
      </div>
      <div className="mb-5 p-3 rounded-lg border border-border">
        <Skeleton delay={80} className="h-6 w-32 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} delay={150 + i * 50} rounded="xl" className="h-24 w-full border border-border/50" />
        ))}
      </div>
    </PageSkeleton>
  );
}

export default async function IndicatorsPage() {
  const indicators = await getIndicators();

  return (
    <Suspense fallback={<IndicatorsSkeleton />}>
      <IndicatorsClient indicators={indicators} />
    </Suspense>
  );
}
