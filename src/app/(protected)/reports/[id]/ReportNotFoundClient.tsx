'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useHeader } from '@/components/layout/HeaderContext';
import { Button } from '@/components/ui/button';

export function ReportNotFoundClient() {
  const { setHeader, clearHeader } = useHeader();

  useEffect(() => {
    setHeader({ title: 'Report not found' });
    return clearHeader;
  }, [setHeader, clearHeader]);

  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground mb-4">
        This report does not exist or you don&apos;t have access.
      </p>
      <Button variant="outline" asChild>
        <Link href="/reports">← Back to reports</Link>
      </Button>
    </div>
  );
}
