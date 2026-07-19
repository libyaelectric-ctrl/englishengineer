import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Flame, Bolt } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { SectionCard } from '@/shared/components/SectionCard';
import type { DailyMission } from '@/features/profile';

interface Props {
  isLoading: boolean;
  missions: DailyMission[];
  learningState?: {
    streak: number;
    xp: number;
    coins: number;
  };
}

export const CurriculumTodayTab = ({
  isLoading,
  missions,
  learningState,
}: Props) => {
  const navigate = useNavigate();
  const streak = learningState?.streak ?? 0;
  const xp = learningState?.xp ?? 0;
  const targetXp = 100;
  const progressPercent = Math.min(100, Math.round((xp % targetXp) * 1)); // Mock daily goal completion percentage
  const displayProgressPercent = progressPercent > 0 ? progressPercent : 45; // Fallback to 45% if 0 for visual check

  const dayIndexStr = `DAY-${streak < 9 ? '0' : ''}${streak + 1}`;

  return (
    <SectionCard
      id="today"
      title="Recommended Today"
      subtitle="Chosen from independent skill progress, vocabulary memory, current-level databases, and weaknesses"
      icon={Sparkles}
    >
      <div className="font-sans relative space-y-6">
        {/* Daily Mission Briefing Header / System Status Panel */}
        <div className="rounded-[4px] border border-border-soft bg-surface p-5 shadow-sm relative overflow-hidden">
          {/* Grid pattern background */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:16px_16px]" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 border-b border-border-soft pb-4">
            <div>
              <span className="font-mono text-[9px] font-bold text-muted-copy uppercase tracking-widest">
                {dayIndexStr} // SYSTEM BRIEFING
              </span>
              <h2 className="text-sm font-bold text-foreground mt-1.5 tracking-tight">
                Daily Operations Hub
              </h2>
              <p className="text-xs text-muted-copy mt-0.5 font-medium">
                Verify system status metrics and complete active recommendations
                to maintain your streak.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-[4px] border border-[#0047bb]/20 bg-[#0047bb]/5 px-2 py-0.5 text-[9px] font-bold text-[#0047bb] uppercase tracking-wider">
                OPS-CURRENT
              </span>
              <span className="rounded-[4px] border border-success/20 bg-success/5 px-2 py-0.5 text-[9px] font-bold text-success uppercase tracking-wider">
                STATUS-ONLINE
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Daily Streak Box nested using #f3f3fd */}
            <div className="rounded-[4px] border border-border-soft/60 bg-[#f3f3fd] p-3.5 flex items-start gap-3">
              <span className="rounded-[4px] bg-surface border border-border-soft p-1.5 text-[#0047bb] shrink-0 shadow-sm">
                <Flame className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-copy block">
                  Daily Streak
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {streak} Days Active
                </span>
              </div>
            </div>

            {/* Daily Intensity Box */}
            <div className="rounded-[4px] border border-border-soft/60 bg-[#f3f3fd] p-3.5 flex items-start gap-3">
              <span className="rounded-[4px] bg-surface border border-border-soft p-1.5 text-[#0047bb] shrink-0 shadow-sm">
                <Bolt className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-copy block">
                  Daily Intensity
                </span>
                <span className="text-sm font-bold text-foreground mt-1 block">
                  {xp % 100} / 100 XP Target
                </span>
              </div>
            </div>

            {/* Daily Progress loading bar */}
            <div className="rounded-[4px] border border-border-soft/60 bg-[#f3f3fd] p-3.5 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-muted-copy">
                <span>Mission progress</span>
                <span>{displayProgressPercent}%</span>
              </div>
              <div className="w-full bg-[#d9d9e3] h-2.5 border border-border-soft mt-2 relative overflow-hidden rounded-[0px]">
                <div
                  className="bg-[#0047bb] h-full transition-all duration-500 rounded-[0px]"
                  style={{ width: `${displayProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Modules Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading
            ? [0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-[4px] border border-border-soft bg-surface-hover"
                />
              ))
            : missions.map((mission, index) => {
                const isActive = index === 0;
                const taskIdStr = `${dayIndexStr}.0${index + 1}`;
                return (
                  <article
                    key={mission.id}
                    className={`flex min-h-44 flex-col rounded-[4px] border p-5 shadow-sm transition-all hover:border-[#0047bb]/40 ${
                      isActive
                        ? 'border-y border-r border-border-soft border-l-[3px] border-l-[#0047bb] bg-surface'
                        : 'border-border-soft bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold text-muted-copy uppercase tracking-widest">
                          {taskIdStr}
                        </span>
                        {isActive && (
                          <span className="rounded-[4px] bg-[#0047bb]/10 border border-primary/25 px-1 py-0.5 text-[8px] font-bold text-[#0047bb] uppercase tracking-wider">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-foreground font-mono">
                        {mission.cefrBand}
                      </span>
                    </div>

                    <h3 className="mt-4 font-bold text-foreground text-sm leading-snug">
                      {mission.title}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-5 text-muted-copy font-medium">
                      {mission.reason}
                    </p>

                    <Button
                      variant={isActive ? 'primary' : 'ghost'}
                      className={`mt-4 w-full h-9 inline-flex items-center justify-center rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm gap-1.5 border transition-all ${
                        isActive
                          ? 'bg-[#0047bb] hover:bg-[#0047bb]/90 border-[#0047bb] text-white'
                          : 'bg-surface hover:bg-surface-hover border-border-soft text-[#0047bb]'
                      }`}
                      onClick={() => navigate(mission.route)}
                    >
                      {isActive
                        ? 'Start active mission'
                        : 'Review recommendation'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </article>
                );
              })}
        </div>
      </div>
    </SectionCard>
  );
};
