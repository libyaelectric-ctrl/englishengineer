import { ArrowRight, BookOpen, Target } from 'lucide-react';

import React from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { MetricCard } from '@/shared/components/MetricCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { resolveDefaultDiscipline } from '@/features/learning-path';
import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

export const DashboardPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);

  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  const discipline = resolveDefaultDiscipline(
    (currentUser?.engineeringDiscipline as EngineeringDiscipline) || profile?.discipline
  );
  const meta = DISCIPLINE_META[discipline];

  // Real data from learning store
  const xp = useLearningStore((s) => s.xp);
  const streak = useLearningStore((s) => s.streak);
  const hearts = useLearningStore((s) => s.hearts);
  const activeMissions = useLearningStore(
    (s) => s.missions?.filter((m) => m.status === 'active').length || 0
  );

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
              <p className="mt-0.5 text-xs font-medium text-muted-copy">
                {currentUser.email}
              </p>
            )}
            {meta && (
              <p className="mt-1 text-sm text-muted-copy">
                {translate(meta.labelKey as TranslationKey)} •{' '}
                {translate(meta.descriptionKey as TranslationKey)}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/curriculum/today"
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
          <span>
            {streak > 0 && `🔥 ${streak} day streak`}
          </span>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
