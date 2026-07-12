import React from 'react';
import { useLearningStore } from '@/core/learning';
import { cn } from '@/shared/utils/cn';

export const Heatmap: React.FC = () => {
  const sessions = useLearningStore((state) => state.studySessions);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const activityMap = new Map<string, number>();
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString();
    activityMap.set(key, (activityMap.get(key) || 0) + s.score);
  });

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-muted-copy">
          Daily Activity Streak
        </h3>
        <span className="text-xs font-semibold text-green-500">
          {sessions.length} sessions
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto py-1 custom-scrollbar">
        {days.map((day, i) => {
          const key = day.toISOString();
          const score = activityMap.get(key) || 0;
          let levelClass = 'bg-surface border border-border-soft';
          if (score > 0 && score <= 50)
            levelClass =
              'bg-green-200 border-green-300 dark:bg-green-900/40 dark:border-green-800';
          if (score > 50 && score <= 200)
            levelClass =
              'bg-green-400 border-green-500 dark:bg-green-700 dark:border-green-600';
          if (score > 200)
            levelClass =
              'bg-green-600 border-green-700 dark:bg-green-500 dark:border-green-400';

          return (
            <div
              key={key}
              title={`${day.toLocaleDateString()}: ${Math.round(score)} XP`}
              className={cn(
                'h-6 w-6 rounded-sm shrink-0 transition-all cursor-crosshair hover:scale-110',
                levelClass,
                i === 29 &&
                  'ring-2 ring-primary ring-offset-1 ring-offset-background' // highlight today
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
