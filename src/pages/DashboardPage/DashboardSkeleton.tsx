import { Target } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Skeleton } from '@/shared/components/Skeleton';

export const DashboardSkeleton = () => (
  <div className="mx-auto max-w-4xl space-y-6 pb-8">
    <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <Skeleton className="h-7 w-40" />
    </div>
    <div className="space-y-6">
      <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </div>
      <div className="premium-panel overflow-hidden p-6 sm:p-8">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-3 h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
        <Skeleton className="mt-6 h-12 w-full" />
      </div>
      <SectionCard title="Progress Cockpit" subtitle="" icon={Target}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-card border border-border-soft bg-surface p-4 space-y-3"
            >
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  </div>
);
