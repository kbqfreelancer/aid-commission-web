import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSession } from '@/lib/api-server';
import { getReport, getIndicators } from '@/lib/data';
import { ReportDetailClient } from './ReportDetailClient';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/index';

function ReportDetailSkeleton() {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 ml-60 px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/auth/login');

  const [report, indicators] = await Promise.all([getReport(id), getIndicators()]);

  if (!report) {
    return (
      <AppShell serverUser={session.user} title="Report not found">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            This report does not exist or you don't have access.
          </p>
          <Button variant="outline" asChild>
            <Link href="/reports">← Back to reports</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <Suspense fallback={<ReportDetailSkeleton />}>
      <ReportDetailClient
        report={report}
        indicators={indicators}
        id={id}
        serverUser={session.user}
      />
    </Suspense>
  );
}
