import { ArrowRight, BookOpenCheck, Clock3, Target } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { LearningProfileRepository } from '@/shared/services/learning-profile.repository';
import type { SkillName } from '@/shared/types/domain.types';

import { useAuthStore } from '@/features/auth';
import { LearningProfileEngine } from '@/shared/services/learning-profile-engine.service';

import type { LearningTaskRecommendation } from './learning-orchestrator.types';
import { LearningTaskEngine } from './learning-task.engine';

export const SkillEntryBrief = ({
  skill,
  compact = false,
}: {
  skill: SkillName;
  compact?: boolean;
}) => {
  const learning = useLearningStore(
    useShallow((s) => ({
      xp: s.xp,
      level: s.level,
      coins: s.coins,
      elo: s.elo,
      streak: s.streak,
      lastActivityDate: s.lastActivityDate,
      missions: s.missions,
      studySessions: s.studySessions,
      scoreHistory: s.scoreHistory,
      xpHistory: s.xpHistory,
      eloHistory: s.eloHistory,
      achievements: s.achievements,
      vocabularyPool: s.vocabularyPool,
      grammarPool: s.grammarPool,
      speakingPool: s.speakingPool,
    }))
  );
  const userId = useAuthStore((state) => state.currentUser?.id);
  const profile = useMemo(
    () =>
      LearningProfileEngine.buildProfileSnapshot(
        LearningProfileRepository.getProfile(userId || 'local-user'),
        learning
      ),
    [learning, userId]
  );
  const [recommendation, setRecommendation] = useState<LearningTaskRecommendation | null>(null);

  useEffect(() => {
    let active = true;
    LearningTaskEngine.createRecommendation(profile, skill)
      .then((next) => {
        if (active) setRecommendation(next);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [profile, skill]);

  if (!recommendation) {
    return (
      <div className="h-24 animate-pulse rounded-[4px] border border-border-soft bg-surface-hover" />
    );
  }

  if (compact) {
    return (
      <div className="rounded-[4px] border border-border-soft bg-surface-hover p-3.5 mb-2 text-left shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
            {recommendation.targetCefr}
          </span>
          <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
            Lesson {recommendation.lessonNumber}
          </span>
          <span className="rounded-[4px] border border-border-soft bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-copy uppercase tracking-wider">
            {recommendation.estimatedMinutes}m
          </span>
        </div>
        <p className="mt-2 text-xs font-bold text-foreground leading-snug">
          {recommendation.sharedLessonTitle}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-copy font-medium">
          {recommendation.whyRecommended}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-[4px] border border-primary/25 bg-primary/5 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              System recommendation
            </p>
            <span className="rounded-[4px] border border-primary/25 bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {recommendation.targetCefr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-primary/25 bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              <BookOpenCheck className="h-3.5 w-3.5" /> Lesson {recommendation.lessonNumber}
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-sky-900 uppercase tracking-wider">
            {recommendation.sharedLessonTitle}
          </p>
          <p className="mt-2 text-sm font-bold text-foreground">{recommendation.whyRecommended}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-copy font-medium">
            <span>
              Vocabulary:{' '}
              {recommendation.vocabularyFocus
                .slice(0, 3)
                .map(({ term }) => term.term)
                .join(', ') || 'current-level database set'}
            </span>
            <span>
              Grammar: {recommendation.grammarFocus[0]?.title ?? 'current-level foundation'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {recommendation.estimatedMinutes} min
            </span>
          </div>
          <details className="mt-3 text-xs text-muted-copy font-medium">
            <summary className="cursor-pointer font-bold text-primary hover:underline uppercase tracking-wider text-[10px]">
              Why this lesson and how ELO moves
            </summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {Object.values(recommendation.explanation).map((line) => (
                <p
                  key={line}
                  className="rounded-[4px] border border-border-soft bg-surface p-2 leading-5 text-xs font-medium shadow-sm"
                >
                  {line}
                </p>
              ))}
            </div>
          </details>
        </div>
        <Link
          to="/curriculum"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-[4px] border border-border-soft bg-surface px-4 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-hover cursor-pointer shadow-sm"
        >
          Manual change <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};
