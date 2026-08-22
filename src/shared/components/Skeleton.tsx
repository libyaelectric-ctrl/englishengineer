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
