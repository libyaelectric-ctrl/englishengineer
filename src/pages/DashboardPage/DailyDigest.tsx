/**
 * Smart Daily Digest
 *
 * Shows personalized daily summary with:
 * - Today's progress across all modules
 * - Streak status and protection suggestions
 * - Personalized AI recommendations
 * - Quick action buttons
 */
import { BookOpen, Brain, Headphones, PenTool, Sparkles, Target, Trophy, Zap } from 'lucide-react';

import { memo, useMemo } from 'react';

import { useLearningStore } from '@/core/learning';

interface DigestItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

/**
 * Calculate streak status and recommendations
 */
const calculateStreakStatus = (
  streak: number,
  hearts: number
): { status: string; message: string; color: string } => {
  if (streak >= 30) {
    return {
      status: 'legend',
      message: `${streak}-day streak! You're on fire! 🔥`,
      color: 'text-amber-500',
    };
  }
  if (streak >= 14) {
    return {
      status: 'strong',
      message: `${streak}-day streak! Keep it up! 💪`,
      color: 'text-green-500',
    };
  }
  if (streak >= 7) {
    return {
      status: 'growing',
      message: `${streak}-day streak! Building momentum! 📈`,
      color: 'text-blue-500',
    };
  }
  if (streak >= 1) {
    return {
      status: 'started',
      message: `${streak}-day streak. Don't break it! 🎯`,
      color: 'text-primary',
    };
  }
  if (hearts < 3) {
    return {
      status: 'at-risk',
      message: 'Start today to begin your streak! ⚡',
      color: 'text-red-500',
    };
  }
  return {
    status: 'new',
    message: 'Ready to start your learning journey?',
    color: 'text-muted-copy',
  };
};

/**
 * Get personalized time-based recommendation
 */
const getTimeRecommendation = (): {
  message: string;
  icon: React.ComponentType<{ className?: string }>;
} => {
  const hour = new Date().getHours();

  if (hour < 9) {
    return {
      message: 'Start your day with 10 min vocabulary review',
      icon: BookOpen,
    };
  }
  if (hour < 12) {
    return {
      message: 'Morning focus time — try a grammar exercise',
      icon: Target,
    };
  }
  if (hour < 14) {
    return {
      message: 'Lunch break? Do a quick speaking practice',
      icon: Headphones,
    };
  }
  if (hour < 17) {
    return {
      message: 'Afternoon session — review your writing',
      icon: PenTool,
    };
  }
  if (hour < 20) {
    return {
      message: 'Evening wind-down with reading practice',
      icon: BookOpen,
    };
  }
  return {
    message: 'Night owl? Try a quick vocabulary drill',
    icon: Zap,
  };
};

export const DailyDigest = memo(() => {
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const studySessions = useLearningStore((s) => s.studySessions);
  const weakTermIds = useLearningStore((s) => s.weakTermIds);

  const streakStatus = useMemo(() => calculateStreakStatus(streak, hearts), [streak, hearts]);
  const timeRecommendation = useMemo(() => getTimeRecommendation(), []);

  // Today's progress calculation
  const todayModules = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todaySessions = (studySessions ?? []).filter((s) => new Date(s.timestamp) >= todayStart);

    return {
      vocabulary: todaySessions.filter((s) => s.module === 'Vocabulary').length,
      grammar: todaySessions.filter((s) => s.module === 'Grammar').length,
      reading: todaySessions.filter((s) => s.module === 'Reading').length,
      writing: todaySessions.filter((s) => s.module === 'Writing').length,
      speaking: todaySessions.filter((s) => s.module === 'Speaking').length,
      listening: todaySessions.filter((s) => s.module === 'Listening').length,
      total: todaySessions.length,
    };
  }, [studySessions]);

  // Build digest items
  const digestItems: DigestItem[] = useMemo(
    () => [
      {
        id: 'xp',
        icon: Zap,
        label: 'Today XP',
        value: `${todayModules.total * 10} XP`,
        color: 'text-amber-500',
      },
      {
        id: 'modules',
        icon: BookOpen,
        label: 'Modules Practiced',
        value: `${todayModules.total}/6`,
        color: 'text-blue-500',
      },
      {
        id: 'streak',
        icon: Trophy,
        label: 'Streak',
        value: `${streak} days`,
        color: streakStatus.color,
      },
      {
        id: 'reviews',
        icon: Brain,
        label: 'Weak Terms',
        value: `${(weakTermIds ?? []).length} to review`,
        color: (weakTermIds ?? []).length > 0 ? 'text-amber-500' : 'text-green-500',
      },
    ],
    [todayModules, streak, streakStatus, weakTermIds]
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Daily Digest</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-copy">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      {/* Today's Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {digestItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-[var(--radius-card)] border border-border-soft bg-surface-hover p-3 text-center"
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
              <p className="text-xs font-bold text-foreground">{item.value}</p>
              <p className="text-[10px] text-muted-copy">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Streak Status */}
      <div className="flex items-center gap-2 p-3 rounded-[var(--radius-card)] bg-surface-hover border border-border-soft">
        <Trophy className={`h-4 w-4 ${streakStatus.color}`} />
        <p className={`text-xs font-bold ${streakStatus.color}`}>{streakStatus.message}</p>
      </div>

      {/* Time-based Recommendation */}
      <div className="flex items-start gap-2 p-3 rounded-[var(--radius-card)] bg-primary/5 border border-primary/20">
        <timeRecommendation.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-primary">AI Recommendation</p>
          <p className="text-xs text-foreground mt-0.5">{timeRecommendation.message}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/vocabulary"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          Vocabulary
        </a>
        <a
          href="/grammar"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
        >
          <Target className="h-3 w-3" />
          Grammar
        </a>
        <a
          href="/writing"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
        >
          <PenTool className="h-3 w-3" />
          Writing
        </a>
        <a
          href="/speaking"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-card)] border border-border-soft bg-surface text-xs font-bold text-foreground hover:bg-surface-hover transition-colors"
        >
          <Headphones className="h-3 w-3" />
          Speaking
        </a>
      </div>

      {/* Module Progress Bars */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-foreground">Today's Coverage</p>
        {Object.entries(todayModules)
          .filter(([key]) => key !== 'total')
          .map(([module, count]) => (
            <div key={module} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-copy w-16 capitalize">
                {module}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(100, count * 20)}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted-copy w-6 text-right">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
});

DailyDigest.displayName = 'DailyDigest';
