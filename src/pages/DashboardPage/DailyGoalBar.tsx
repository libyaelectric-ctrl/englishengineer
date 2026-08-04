import { useShallow } from 'zustand/shallow';

import { useLearningStore } from '@/core/learning';

import { ProgressBar } from '@/shared/components/ProgressBar';

import { useLocalizationStore } from '@/features/localization';

const DAILY_GOAL = 10;

export const DailyGoalBar = () => {
  const studySessions = useLearningStore(useShallow((s) => s.studySessions));
  const translate = useLocalizationStore((s) => s.translate);
  const today = new Date().toDateString();
  const todayCount = studySessions.filter(
    (s) => new Date(s.timestamp).toDateString() === today
  ).length;
  return (
    <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm animate-on-scroll">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">
          {translate('dashboard.todayProgress')
            .replace('{current}', String(todayCount))
            .replace('{goal}', String(DAILY_GOAL))}
        </span>
        <span className="text-[10px] font-medium text-muted-copy">
          {Math.min(todayCount, DAILY_GOAL)}/{DAILY_GOAL}
        </span>
      </div>
      <ProgressBar
        value={Math.min(todayCount, DAILY_GOAL)}
        max={DAILY_GOAL}
        color={todayCount >= DAILY_GOAL ? 'emerald' : 'primary'}
      />
    </div>
  );
};
