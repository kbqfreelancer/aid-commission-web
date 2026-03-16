import { Suspense } from 'react';
import { getIndicators } from '@/lib/data';
import { IndicatorsClient } from './IndicatorsClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function IndicatorsSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 50, 100].map((delay, i) => (
          <Skeleton key={i} delay={delay} rounded="lg" className="h-20 border border-border/50" />
        ))}
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
