import { Suspense } from 'react';
import { getReport, getIndicators } from '@/lib/data';
import { ReportDetailClient } from './ReportDetailClient';
import { ReportNotFoundClient } from './ReportNotFoundClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function ReportDetailSkeleton() {
  return (
    <PageSkeleton>
      <div className="max-w-4xl mx-auto space-y-5">
        <Skeleton delay={0} rounded="xl" className="h-32 w-full border border-border/50" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} delay={(i + 1) * 60} rounded="xl" className="h-44 w-full border border-border/50" />
        ))}
      </div>
    </PageSkeleton>
  );
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [report, indicators] = await Promise.all([getReport(id), getIndicators()]);

  if (!report) {
    return <ReportNotFoundClient />;
  }

  return (
    <Suspense fallback={<ReportDetailSkeleton />}>
      <ReportDetailClient
        report={report}
        indicators={indicators}
        id={id}
      />
    </Suspense>
  );
}
