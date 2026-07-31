import { CheckCircle2, TrendingUp } from 'lucide-react';

export const CefrProgressMeterCard = () => {
  const currentLevel = 'B2+ Professional';
  const targetLevel = 'C1 Technical Defenses';
  const progressPct = 82;

  return (
    <div className="rounded-2xl border border-primary/25 bg-surface/90 backdrop-blur-md p-4 shadow-xl space-y-3 relative light-sweep-container overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-foreground">Interactive CEFR Progress Meter</span>
        </div>
        <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
          {progressPct}% to C1 Target
        </span>
      </div>

      <div className="flex items-center gap-4 bg-background/80 rounded-xl p-3 border border-border-soft">
        {/* Circular Progress Ring */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-border-soft"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-primary"
              strokeDasharray={`${progressPct}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-extrabold text-foreground font-mono">
            {progressPct}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Current: {currentLevel}</span>
          </div>
          <div className="text-[10px] text-muted-copy">
            Next Milestone: <span className="font-bold text-primary">{targetLevel}</span>
          </div>
          <div className="text-[9px] text-emerald-600 font-semibold pt-0.5">
            +14% gain in ASTM/FIDIC vocabulary accuracy this week.
          </div>
        </div>
      </div>
    </div>
  );
};
