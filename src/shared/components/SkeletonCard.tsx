import { cn } from '@/shared/utils/cn';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-soft bg-surface/50 p-5 shadow-sm animate-pulse space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-surface-hover/80" />
        <div className="h-4 w-12 rounded bg-surface-hover/80" />
      </div>
      <div className="h-6 w-3/4 rounded bg-surface-hover/80" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-surface-hover/60" />
        <div className="h-3 w-5/6 rounded bg-surface-hover/60" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-7 w-20 rounded bg-surface-hover/80" />
        <div className="h-3 w-16 rounded bg-surface-hover/60" />
      </div>
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border-soft bg-background/95 backdrop-blur-xl mb-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-24 rounded bg-surface-hover/80" />
        <div className="h-4 w-10 rounded bg-surface-hover/80" />
        <div className="hidden sm:block h-3 w-48 rounded bg-surface-hover/60" />
      </div>
      <div className="flex gap-1">
        <div className="h-7 w-16 rounded bg-surface-hover/80" />
        <div className="h-7 w-16 rounded bg-surface-hover/80" />
        <div className="h-7 w-16 rounded bg-surface-hover/80" />
      </div>
    </div>
  );
}
