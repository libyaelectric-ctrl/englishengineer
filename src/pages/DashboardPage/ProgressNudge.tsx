import { Zap } from 'lucide-react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

interface Nudge {
  message: string;
  actionLabel: string;
  actionTo: string;
}

function computeNudge(state: {
  streak: number;
  xp: number;
  hearts: number;
  lastActivityDate: string | null;
  missions?: Array<{ status: string }>;
}): Nudge | null {
  const { streak, xp, hearts, lastActivityDate, missions } = state;

  // Not practiced today
  const today = new Date().toISOString().slice(0, 10);
  if (lastActivityDate !== today && lastActivityDate !== null) {
    const daysSince = Math.floor((Date.now() - new Date(lastActivityDate).getTime()) / 86_400_000);
    if (daysSince >= 1 && streak > 0) {
      return {
        message: `Your ${streak}-day streak is at risk! A quick 10-min session keeps it alive.`,
        actionLabel: 'Keep Streak',
        actionTo: '/curriculum',
      };
    }
    if (daysSince >= 3) {
      return {
        message: `It's been ${daysSince} days. Jump back in — your engineering English awaits!`,
        actionLabel: 'Resume Learning',
        actionTo: '/curriculum',
      };
    }
  }

  // No active missions
  const activeMissions = missions?.filter((m) => m.status === 'active').length ?? 0;
  if (activeMissions === 0 && xp === 0) {
    return {
      message: 'Start your first mission to begin earning XP!',
      actionLabel: 'Start First Mission',
      actionTo: '/curriculum',
    };
  }

  // Hearts depleted
  if (hearts === 0) {
    return {
      message: "You've run out of hearts. Come back tomorrow for a fresh start!",
      actionLabel: 'View Progress',
      actionTo: '/progress',
    };
  }

  return null;
}

export function ProgressNudge() {
  const streak = useLearningStore((s) => s.streak);
  const xp = useLearningStore((s) => s.xp);
  const hearts = useLearningStore((s) => s.hearts);
  const lastActivityDate = useLearningStore((s) => s.lastActivityDate);
  const missions = useLearningStore((s) => s.missions);

  const nudge = computeNudge({ streak, xp, hearts, lastActivityDate, missions });
  if (!nudge) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Zap className="h-4 w-4 text-primary" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground">{nudge.message}</p>
      <Link
        to={nudge.actionTo}
        className="shrink-0 rounded-[4px] border border-primary/25 bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/20 transition-colors"
      >
        {nudge.actionLabel}
      </Link>
    </div>
  );
}
