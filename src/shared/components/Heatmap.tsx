import { memo, useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

const HEATMAP_DAYS = 30;
const ACTIVITY_LOW_THRESHOLD = 50;
const ACTIVITY_MEDIUM_THRESHOLD = 200;

interface StudySessionLike {
  timestamp: string;
  score: number;
}

interface HeatmapProps {
  sessions: StudySessionLike[];
}

export const Heatmap = memo(({ sessions }: HeatmapProps) => {
  const { days, activityMap } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayList = Array.from({ length: HEATMAP_DAYS }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (HEATMAP_DAYS - 1 - i));
      return d;
    });

    const map = new Map<string, number>();
    sessions.forEach((s) => {
      const d = new Date(s.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      map.set(key, (map.get(key) || 0) + s.score);
    });

    return { days: dayList, activityMap: map };
  }, [sessions]);

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-muted-copy">Daily Activity Streak</h3>
        <span className="text-xs font-semibold text-green-500">{sessions.length} sessions</span>
      </div>
      <div
        className="flex gap-1.5 overflow-x-auto py-1 custom-scrollbar"
        role="list"
        aria-label={`Daily activity for the last ${HEATMAP_DAYS} days`}
      >
        {days.map((day, i) => {
          const key = day.toISOString();
          const score = activityMap.get(key) || 0;
          let levelClass = 'bg-surface border border-border-soft';
          if (score > 0 && score <= ACTIVITY_LOW_THRESHOLD)
            levelClass = 'bg-green-200 border-green-300 dark:bg-green-900/40 dark:border-green-800';
          if (score > ACTIVITY_LOW_THRESHOLD && score <= ACTIVITY_MEDIUM_THRESHOLD)
            levelClass = 'bg-green-400 border-green-500 dark:bg-green-700 dark:border-green-600';
          if (score > ACTIVITY_MEDIUM_THRESHOLD)
            levelClass = 'bg-green-600 border-green-700 dark:bg-green-500 dark:border-green-400';

          return (
            <div
              key={key}
              role="listitem"
              title={`${day.toLocaleDateString()}: ${Math.round(score)} XP`}
              aria-label={`${day.toLocaleDateString()}: ${Math.round(score)} XP earned`}
              className={cn(
                'h-6 w-6 rounded-[var(--radius-card)] shrink-0 transition-all cursor-crosshair hover:scale-110',
                levelClass,
                i === HEATMAP_DAYS - 1 && 'ring-2 ring-primary ring-offset-1 ring-offset-background'
              )}
            />
          );
        })}
      </div>
    </div>
  );
});
Heatmap.displayName = 'Heatmap';
