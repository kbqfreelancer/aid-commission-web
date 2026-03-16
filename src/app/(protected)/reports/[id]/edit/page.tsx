import { Suspense } from 'react';
import { getReport, getIndicators, getOrganisations } from '@/lib/data';
import { ReportEditClient } from '@/app/(protected)/reports/[id]/edit/ReportEditClient';
import { ReportNotFoundClient } from '../ReportNotFoundClient';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { Skeleton } from '@/components/ui/index';

function EditReportSkeleton() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton delay={0} rounded="xl" className="h-96 border border-border/50" />
        <Skeleton delay={80} rounded="xl" className="h-64 lg:col-span-2 border border-border/50" />
      </div>
    </PageSkeleton>
  );
}

export default async function ReportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [report, indicators, orgs] = await Promise.all([
    getReport(id),
    getIndicators(),
    getOrganisations(),
  ]);

  if (!report) {
    return <ReportNotFoundClient />;
  }

  if (report.status !== 'draft') {
    return <ReportNotFoundClient />;
  }

  return (
    <Suspense fallback={<EditReportSkeleton />}>
      <ReportEditClient
        report={report}
        indicators={indicators}
        orgs={orgs}
        id={id}
      />
    </Suspense>
  );
}
