import { ArrowRight, BookOpen, Globe, Hash, Settings, Target, TrendingUp, Zap } from 'lucide-react';

import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { MetricCard } from '@/shared/components/MetricCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { SkeletonPage } from '@/shared/components/Skeleton';
import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { useShortcutHint } from '@/shared/hooks/useShortcutHint';

import { useAuthStore } from '@/features/auth';
import { resolveDefaultDiscipline } from '@/features/learning-path';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

import { DailyChallenge } from './DailyChallenge';
import { DailyDigest } from './DailyDigest';
import { ProgressNudge } from './ProgressNudge';

export const DashboardPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);
  const currentLanguage = useLocalizationStore((state) => state.language);

  // Show Ctrl+K shortcut hint on first visit
  useShortcutHint();

  // Real data from learning store (must be called before any early return)
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const activeMissions = useLearningStore(
    (s) => s.missions?.filter((m) => m.status === 'active').length || 0
  );

  // Auto-refresh: re-read profile every 30s for cross-tab sync
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Show skeleton while auth store hydrates
  if (!currentUser) {
    return (
      <PageContainer className="max-w-6xl">
        <SkeletonPage />
      </PageContainer>
    );
  }

  const profile = LearningProfileRepository.getProfile(currentUser.id || 'local-user');
  const discipline = resolveDefaultDiscipline(
    (currentUser.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline
  );
  const meta = DISCIPLINE_META[discipline];

  // Real data from profile
  const vocabBand = profile?.skills?.vocabulary?.cefrBand ?? 'A1';
  const targetLevel = currentUser?.targetLevel ?? 'C1';
  const overallProgress = profile?.skills?.vocabulary?.progressToNextBand ?? 0;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? translate('dashboard.goodMorning')
      : hour < 18
        ? translate('dashboard.goodAfternoon')
        : translate('dashboard.goodEvening');

  return (
    <PageContainer className="max-w-6xl">
      {/* Hero Header */}
      <header className="relative overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary">
              {translate('dashboard.commandCenter')}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">
              {greeting}, {currentUser?.displayName ?? ''}!
            </h1>
            {currentUser?.email && (
              <p className="mt-0.5 text-xs font-medium text-muted-copy">{currentUser.email}</p>
            )}
            {meta && (
              <p className="mt-1 text-sm text-muted-copy">
                {translate(meta.labelKey as TranslationKey)} •{' '}
                {translate(meta.descriptionKey as TranslationKey)}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/curriculum"
                aria-label={translate('dashboard.startHere')}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-surface border border-border-soft px-5 py-2.5 text-sm font-bold text-foreground hover:bg-surface-hover transition-colors"
              >
                {translate('dashboard.startHere')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/learning-path"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] border border-primary/25 bg-primary/5 px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                {translate('learningpath.title')}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Summary Card — discipline + language + word count */}
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" aria-hidden="true" />
            {translate('dashboard.myDiscipline')}
          </h2>
          <Link
            to="/profile"
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {translate('profile.save')}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Discipline */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-copy font-medium">
                {translate('onboarding.selectDiscipline')}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {meta ? translate(meta.labelKey as TranslationKey) : discipline}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-border-soft" />

          {/* Interface Language */}
          <div className="flex items-center gap-3 flex-1 min-w-[160px]">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Globe className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-copy font-medium">
                {translate('onboarding.selectLanguageTitle')}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {(() => {
                  const langOption = INTERFACE_LANGUAGES.find((l) => l.id === currentLanguage);
                  return langOption ? `${langOption.nativeLabel} (${langOption.id.toUpperCase()})` : currentLanguage ?? '—';
                })()}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-10 bg-border-soft" />

          {/* Word Count */}
          <div className="flex items-center gap-3 flex-1 min-w-[140px]">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400">
              <Hash className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-copy font-medium">
                {translate('dashboard.words')}
              </p>
              <p className="text-sm font-bold text-foreground">
                {meta?.wordCount?.toLocaleString() ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid — all real data */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label={translate('dashboard.myDiscipline')}
          value={meta ? translate(meta.labelKey as TranslationKey) : discipline}
          icon={BookOpen}
        />
        <MetricCard
          label={translate('dashboard.level')}
          value={vocabBand}
          icon={Target}
          trend={`${translate('dashboard.targetLevel')}: ${targetLevel}`}
        />
        <MetricCard
          label={translate('dashboard.words')}
          value={`${xp} XP`}
          icon={Zap}
          trend={`${streak} day streak`}
        />
        <MetricCard
          label={translate('dashboard.completedTasks')}
          value={`${activeMissions} ${translate('curriculum.items')}`}
          icon={TrendingUp}
        />
      </div>

      {/* Daily Digest */}
      <DailyDigest />

      {/* Daily Challenge */}
      <DailyChallenge />

      {/* Progress Nudge */}
      <ProgressNudge />

      {/* Quick Progress Overview */}
      <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">
            {translate('dashboard.globalProgress')}
          </h2>
          <span className="text-xs font-bold text-primary">{vocabBand}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(5, overallProgress)}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-copy">
          <span>
            {hearts * 20}% {translate('dashboard.competencyIndex')}
          </span>
          <span>{streak > 0 && `🔥 ${streak} day streak`}</span>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
