import React from 'react';

// ---------------------------------------------------------------------------
// Base skeleton
// ---------------------------------------------------------------------------

interface SkeletonProps {
  className?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const Skeleton = React.memo(({ className = '', count = 1, style }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={style}
          className={`animate-pulse rounded-[var(--radius-card)] bg-surface-hover ${className}`}
        />
      ))}
    </>
  );
});
Skeleton.displayName = 'Skeleton';

// ---------------------------------------------------------------------------
// Composed skeletons for common patterns
// ---------------------------------------------------------------------------

export const SkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-2/3" />
    {lines > 0 && <Skeleton className="h-8 w-full" />}
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className="h-3 w-full" style={{ width: `${85 - i * 15}%` }} />
    ))}
  </div>
);

/** Full page skeleton — header + 2-3 content blocks */
export const SkeletonPage = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>
    {/* Stats row */}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} lines={0} />
      ))}
    </div>
    {/* Content area */}
    <div className="space-y-3">
      <Skeleton className="h-48 w-full" />
    </div>
  </div>
);

/** Stat card skeleton — used in dashboard and skill pages */
export const SkeletonStatCard = () => (
  <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4 space-y-2">
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-7 w-24" />
    <Skeleton className="h-2 w-full" />
  </div>
);

/** List skeleton — used for vocab lists, mission lists, etc. */
export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border-soft bg-surface p-3"
      >
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

/** Table skeleton — used for admin tables, billing invoices */
export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="space-y-2">
    {/* Header row */}
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-3 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/** Sidebar skeleton — for right sidebar loading */
export const SkeletonSidebar = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-6 w-24" />
    <Skeleton className="h-20 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
    <Skeleton className="h-8 w-full" />
  </div>
);
