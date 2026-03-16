'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Protected route error:', error);
  }, [error]);

  const isApiUnreachable =
    error.message?.includes('Unable to reach the API') ||
    error.message?.toLowerCase().includes('fetch failed');

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          <AlertCircle size={28} className="text-amber-500" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {isApiUnreachable ? 'API temporarily unavailable' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isApiUnreachable
              ? 'The backend may be starting up. Please wait a moment and try again.'
              : error.message}
          </p>
        </div>
        <Button
          onClick={reset}
          size="sm"
          className="gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950"
        >
          <RefreshCw size={14} />
          Try again
        </Button>
      </div>
    </div>
  );
}
