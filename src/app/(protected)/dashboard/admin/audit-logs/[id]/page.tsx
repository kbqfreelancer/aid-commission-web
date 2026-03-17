import { Suspense } from 'react';
import { AuditLogDetailClient } from './AuditLogDetailClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function AuditLogDetailSkeleton() {
  return (
    <PageSkeleton>
      <div className="max-w-3xl mx-auto space-y-5">
        <Skeleton delay={0} rounded="xl" className="h-24 w-full border border-border/50" />
        <Skeleton delay={50} rounded="xl" className="h-32 w-full border border-border/50" />
        <Skeleton delay={100} rounded="xl" className="h-40 w-full border border-border/50" />
      </div>
    </PageSkeleton>
  );
}

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<AuditLogDetailSkeleton />}>
      <AuditLogDetailClient id={id} />
    </Suspense>
  );
}
