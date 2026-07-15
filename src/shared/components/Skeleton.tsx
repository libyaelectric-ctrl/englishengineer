interface SkeletonProps {
  className?: string;
  count?: number;
  style?: React.CSSProperties;
  variant?: string;
}

export const Skeleton = ({ className = '', count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-lg bg-surface-hover ${className}`}
        />
      ))}
    </>
  );
};

export const SkeletonCard = () => (
  <div className="rounded-xl border border-border-soft bg-surface p-4 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-2/3" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-3 w-full"
        style={{ width: `${85 - i * 15}%` }}
      />
    ))}
  </div>
);
