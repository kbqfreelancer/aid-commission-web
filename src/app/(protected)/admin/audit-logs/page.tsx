import { Suspense } from 'react';
import { AuditTrailsClient } from './AuditTrailsClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function AuditTrailsSkeleton() {
  return (
    <PageSkeleton>
      <Skeleton delay={0} className="h-10 w-full mb-5 rounded-lg" />
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3.5 flex items-center gap-4">
              <Skeleton delay={i * 40} className="h-4 w-32 rounded" />
              <Skeleton delay={i * 40 + 10} className="h-4 w-24 rounded" />
              <Skeleton delay={i * 40 + 20} className="h-4 w-28 rounded" />
              <Skeleton delay={i * 40 + 30} className="h-4 w-20 rounded" />
              <Skeleton delay={i * 40 + 40} className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </PageSkeleton>
  );
}

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditTrailsSkeleton />}>
      <AuditTrailsClient />
    </Suspense>
  );
}
