import React from 'react';

interface StatsGridProps {
  totalStudents: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ totalStudents }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">
          Total Students
        </p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {totalStudents}
        </p>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">
          Active Today
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-600">2</p>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">
          Pro Members
        </p>
        <p className="mt-1 text-2xl font-bold text-blue-600">3</p>
      </div>
      <div className="rounded-xl border border-border-soft bg-surface p-4">
        <p className="text-[10px] font-bold text-muted-copy uppercase">
          AI Request Count
        </p>
        <p className="mt-1 text-2xl font-bold text-purple-600">1,842</p>
      </div>
    </div>
  );
};