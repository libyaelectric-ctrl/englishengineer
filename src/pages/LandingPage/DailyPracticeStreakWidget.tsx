import { Award, Flame, Target } from 'lucide-react';

import { useLocalizationStore } from '@/features/localization';

export const DailyPracticeStreakWidget = () => {
  const translate = useLocalizationStore((s) => s.translate);
  const streakDays = 5;
  const targetMins = 25;
  const currentMins = 20;
  const progressPct = Math.round((currentMins / targetMins) * 100);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md p-4 shadow-lg space-y-3 relative light-sweep-container overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 font-bold border border-amber-500/40">
            <Flame className="h-4 w-4 fill-amber-500 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-foreground flex items-center gap-1">
              <span>{translate('landing.streakTitle').replace('{days}', String(streakDays))}</span>
              <span className="text-[10px] text-amber-500">
                {translate('landing.streakOnFire')}
              </span>
            </div>
            <div className="text-[10px] text-muted-copy">{translate('landing.streakHabit')}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground font-mono">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span>
            {translate('landing.streakProgress')
              .replace('{current}', String(currentMins))
              .replace('{target}', String(targetMins))}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 w-full rounded-full bg-border-soft overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-primary to-emerald-500 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-muted-copy">
          <span>{translate('landing.streakGoal').replace('{pct}', String(progressPct))}</span>
          <span className="text-emerald-500">
            {translate('landing.streakRemaining').replace(
              '{mins}',
              String(targetMins - currentMins)
            )}
          </span>
        </div>
      </div>

      {/* Achievement Badges Row */}
      <div className="flex items-center justify-between pt-1 border-t border-amber-500/20 text-[10px] font-bold text-foreground">
        <span className="text-muted-copy flex items-center gap-1">
          <Award className="h-3.5 w-3.5 text-amber-500" /> {translate('landing.streakBadges')}
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[9px] text-amber-600">
            {translate('landing.streakBadge1')}
          </span>
          <span className="rounded bg-primary/15 border border-primary/30 px-1.5 py-0.2 text-[9px] text-primary">
            {translate('landing.streakBadge2')}
          </span>
        </div>
      </div>
    </div>
  );
};
