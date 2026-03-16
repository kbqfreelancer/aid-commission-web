'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: {
      queries:   { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  }));
  return (
    <QueryClientProvider client={qc}>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(118,95%,10%)',
            border: '1px solid hsl(118,95%,18%)',
            color: 'hsl(210,40%,96%)',
            fontFamily: 'var(--font-body)',
          },
          classNames: {
            success: 'border-l-4 border-l-[#038C33]',
            error: '!bg-red-600/90 border-l-4 border-l-red-400',
            warning: 'border-l-4 border-l-[#F2BC1B]',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
