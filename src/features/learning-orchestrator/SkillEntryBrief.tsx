import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, Clock3, Target } from 'lucide-react';
import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileEngine,
  LearningProfileRepository,
  type SkillName,
} from '@/features/profile';
import type { LearningTaskRecommendation } from './learning-orchestrator.types';
import { LearningTaskEngine } from './learning-task.engine';

export const SkillEntryBrief = ({
  skill,
  compact = false,
}: {
  skill: SkillName;
  compact?: boolean;
}) => {
  const learning = useLearningStore();
  const userId = useAuthStore((state) => state.currentUser?.id);
  const profile = useMemo(
    () =>
      LearningProfileEngine.buildProfileSnapshot(
        LearningProfileRepository.getProfile(userId || 'local-user'),
        learning
      ),
    [learning, userId]
  );
  const [recommendation, setRecommendation] =
    useState<LearningTaskRecommendation | null>(null);

  useEffect(() => {
    let active = true;
    void LearningTaskEngine.createRecommendation(profile, skill).then(
      (next) => {
        if (active) setRecommendation(next);
      }
    );
    return () => {
      active = false;
    };
  }, [profile, skill]);

  if (!recommendation) {
    return <div className="h-24 animate-pulse rounded-xl bg-surface-hover" />;
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-border-soft bg-surface-hover/30 p-3.5 mb-2 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
            {recommendation.targetCefr}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
            Lesson {recommendation.lessonNumber}
          </span>
          <span className="rounded-full border border-border-soft bg-surface px-2 py-0.5 text-[9px] font-semibold text-muted-copy">
            {recommendation.estimatedMinutes}m
          </span>
        </div>
        <p className="mt-2 text-xs font-bold text-foreground leading-snug">
          {recommendation.sharedLessonTitle}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-copy">
          {recommendation.whyRecommended}
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-xs font-black uppercase text-primary">
              System recommendation
            </p>
            <span className="rounded-full border border-primary/20 bg-surface px-2 py-0.5 text-xs font-bold text-primary">
              {recommendation.targetCefr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-surface px-2 py-0.5 text-xs font-bold text-primary">
              <BookOpenCheck className="h-3.5 w-3.5" /> Lesson{' '}
              {recommendation.lessonNumber}
            </span>
          </div>
          <p className="mt-2 text-xs font-black text-sky-900">
            {recommendation.sharedLessonTitle}
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {recommendation.whyRecommended}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-copy">
            <span>
              Vocabulary:{' '}
              {recommendation.vocabularyFocus
                .slice(0, 3)
                .map(({ term }) => term.term)
                .join(', ') || 'current-level database set'}
            </span>
            <span>
              Grammar:{' '}
              {recommendation.grammarFocus[0]?.title ??
                'current-level foundation'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {recommendation.estimatedMinutes} min
            </span>
          </div>
          <details className="mt-3 text-xs text-muted-copy">
            <summary className="cursor-pointer font-bold text-primary">
              Why this lesson and how ELO moves
            </summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {Object.values(recommendation.explanation).map((line) => (
                <p
                  key={line}
                  className="rounded-[8px] bg-white/80 p-2 leading-5"
                >
                  {line}
                </p>
              ))}
            </div>
          </details>
        </div>
        <a
          href="/curriculum"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-border-soft bg-surface px-4 text-sm font-bold text-foreground transition-colors hover:border-primary/20 hover:bg-primary/5"
        >
          Manual change <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
};
