import React from 'react';
import { Flame, ShieldCheck } from 'lucide-react';

interface StreakFlameWidgetProps {
  streakDays?: number;
  freezeAvailable?: boolean;
}

export const StreakFlameWidget: React.FC<StreakFlameWidgetProps> = ({
  streakDays = 7,
  freezeAvailable = true,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-amber-500/10 via-primary/5 to-surface p-3.5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
        <Flame className="h-6 w-6 animate-bounce" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-foreground tracking-tight">
            {streakDays} Day Practice Streak
          </span>
          {freezeAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success border border-success/20">
              <ShieldCheck className="h-3 w-3" /> Freeze Shield Active
            </span>
          )}
        </div>
        <p className="text-[11px] font-medium text-muted-copy truncate mt-0.5">
          Practice 1 lesson today to keep your technical fluency streak alive!
        </p>
      </div>
    </div>
  );
};
