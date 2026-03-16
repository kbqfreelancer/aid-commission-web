'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/index';

interface PageSkeletonProps {
  children: React.ReactNode;
  className?: string;
}

/** Wrapper for page loading skeletons. Provides consistent layout inside the app shell content area. */
export function PageSkeleton({ children, className }: PageSkeletonProps) {
  return (
    <div className={cn('min-h-[60vh] animate-in fade-in-0 duration-500', className)}>
      {children}
    </div>
  );
}

/** Card-style skeleton with staggered delay. Use for KPI cards, stat blocks, etc. */
export function SkeletonCard({
  delay = 0,
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton
      delay={delay}
      rounded="xl"
      className={cn('border border-border/50', className)}
      {...props}
    />
  );
}
