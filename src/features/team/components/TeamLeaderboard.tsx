import { Crown, Medal, Trophy } from 'lucide-react';

import { useMemo } from 'react';

import { cn } from '@/shared/utils/cn';

import type { TeamMember, TeamProgressSummary } from '../team.types';

interface TeamLeaderboardProps {
  members: TeamMember[];
  summaries: TeamProgressSummary[];
}

const MEDAL_COLORS = [
  'text-amber-500 bg-amber-500/10 border-amber-500/30', // gold
  'text-slate-400 bg-slate-400/10 border-slate-400/30', // silver
  'text-orange-600 bg-orange-600/10 border-orange-600/30', // bronze
];

const MEDAL_ICONS = [Crown, Medal, Medal];

/**
 * Team leaderboard that ranks members by overall progress.
 * Shows top 3 with medals, plus the full ranked list.
 */
export const TeamLeaderboard = ({ members, summaries }: TeamLeaderboardProps) => {
  const ranked = useMemo(() => {
    const summaryMap = new Map(summaries.map((s) => [s.memberId, s]));
    return members
      .map((member) => ({
        member,
        summary: summaryMap.get(member.id),
      }))
      .sort((a, b) => (b.summary?.overallProgress ?? 0) - (a.summary?.overallProgress ?? 0));
  }, [members, summaries]);

  if (ranked.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Leaderboard</h3>
        <span className="text-[10px] font-bold text-muted-copy uppercase tracking-wider">
          {ranked.length} members
        </span>
      </div>

      {/* Top 3 podium */}
      {ranked.length >= 3 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {[1, 0, 2].map((rankIdx) => {
            const entry = ranked[rankIdx];
            if (!entry) return <div key={rankIdx} className="hidden sm:block" />;
            const progress = entry.summary?.overallProgress ?? 0;
            const isTop = rankIdx === 0;
            return (
              <div
                key={entry.member.id}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-3 text-center',
                  isTop ? 'border-primary/40 bg-primary/5' : 'border-border-soft bg-surface-hover'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border',
                    MEDAL_COLORS[rankIdx]
                  )}
                >
                  {(() => {
                    const Icon = MEDAL_ICONS[rankIdx];
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <div className="min-w-0 w-full">
                  <p
                    className={cn(
                      'text-xs font-bold truncate',
                      isTop ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {entry.member.displayName}
                  </p>
                  <p className="text-[10px] text-muted-copy mt-0.5">{progress}% progress</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full ranked list */}
      <div className="space-y-1">
        {ranked.map((entry, idx) => {
          const progress = entry.summary?.overallProgress ?? 0;
          const isTop3 = idx < 3;
          return (
            <div
              key={entry.member.id}
              className={cn(
                'flex items-center gap-3 rounded-[4px] px-3 py-2 transition-colors',
                isTop3 ? 'bg-primary/5' : 'hover:bg-surface-hover'
              )}
            >
              <span
                className={cn(
                  'w-6 text-center text-[10px] font-bold',
                  idx === 0
                    ? 'text-amber-500'
                    : idx === 1
                      ? 'text-slate-400'
                      : idx === 2
                        ? 'text-orange-600'
                        : 'text-muted-copy'
                )}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {entry.member.displayName}
                </p>
                <p className="text-[10px] text-muted-copy">{entry.member.discipline}</p>
              </div>
              <div className="flex items-center gap-2">
                {entry.summary?.cefrEstimate && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    {entry.summary.cefrEstimate}
                  </span>
                )}
                <span className="text-xs font-bold text-foreground tabular-nums w-10 text-right">
                  {progress}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
