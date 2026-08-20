import type { AdminStats } from '@/features/admin';

interface StatsGridProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const value = (v: number | undefined) => (isLoading ? '...' : String(v ?? 0));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">Total Students</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value(stats?.totalUsers)}</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">Active Today</p>
        <p className="mt-1 text-2xl font-bold text-emerald-600">{value(stats?.activeToday)}</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">Pro Members</p>
        <p className="mt-1 text-2xl font-bold text-blue-600">{value(stats?.proMembers)}</p>
      </div>
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">AI Request Count</p>
        <p className="mt-1 text-2xl font-bold text-purple-600">{value(stats?.aiRequestCount)}</p>
      </div>
    </div>
  );
};
