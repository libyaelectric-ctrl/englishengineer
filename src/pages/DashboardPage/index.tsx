import { ArrowRight, BookOpen, Target, TrendingUp, Trophy } from 'lucide-react';

import React from 'react';

import { Link } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
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
  const learningState = useLearningStore.getState();
  const activeMissions = learningState.missions?.filter((m) => m.status === 'active').length || 0;

  const stats = [
    {
      label: translate('dashboard.myDiscipline'),
      value: meta ? translate(meta.labelKey as TranslationKey) : discipline,
      icon: BookOpen,
    },
    {
      label: translate('dashboard.targetLevel'),
      value: 'A1 → C2',
      icon: Target,
    },
    {
      label: translate('curriculum.active'),
      value: `${activeMissions} ${translate('curriculum.items')}`,
      icon: TrendingUp,
    },
    {
      label: translate('dashboard.level'),
      value: 'A1',
      icon: Trophy,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Header / Hero */}
        <header className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-transparent" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                {translate('dashboard.commandCenter')}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
                {translate('dashboard.goodMorning')}, {currentUser?.displayName ?? ''}!
              </h1>
              {currentUser?.email ? (
                <p className="mt-0.5 text-xs font-medium text-[var(--color-muted-copy)]">
                  {currentUser.email}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                {meta
                  ? `${translate(meta.labelKey as TranslationKey)} • ${translate(meta.descriptionKey as TranslationKey)}`
                  : discipline}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  to="/curriculum/today"
                  aria-label={translate('dashboard.startHere')}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--surface)] border border-[var(--color-border-soft)] px-5 py-2.5 text-sm font-bold text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  {translate('dashboard.startHere')}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </header>
        {/* Stats */}{' '}
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Dashboard statistics"
        >
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              role="listitem"
              className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex rounded-[var(--radius-card)] bg-[var(--color-primary)]/10 p-2.5">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <p className="text-xs text-[var(--color-muted-copy)]">{label}</p>
              <p
                className="mt-1 text-lg font-bold text-[var(--foreground)]"
                aria-label={`${label}: ${value}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
