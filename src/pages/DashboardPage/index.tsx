import { ArrowRight, BookOpen, Target, TrendingUp, Trophy } from 'lucide-react';

import React, { useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { DISCIPLINE_META } from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const translate = useLocalizationStore((state) => state.translate);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isLoading && currentUser) {
      const userId = currentUser.id || 'local-user';
      const profile = LearningProfileRepository.getProfile(userId);
      if (!currentUser.engineeringDiscipline || !profile.onboardingCompleted) {
        navigate('/welcome', { replace: true });
      }
    }
  }, [currentUser, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
          <p className="text-[var(--color-muted-copy)]">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.engineeringDiscipline) {
    return null;
  }

  const discipline = currentUser.engineeringDiscipline;
  const meta = DISCIPLINE_META[discipline as keyof typeof DISCIPLINE_META];
  const learningState = useLearningStore.getState();
  const activeMissions = learningState.missions?.filter((m) => m.status === 'active').length || 0;

  const stats = [
    {
      label: translate('dashboard.myDiscipline'),
      value: meta ? translate(meta.labelKey as any) : discipline,
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
          <div className="relative">
            <p className="text-sm font-semibold text-[var(--color-primary)]">
              {translate('dashboard.commandCenter')}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[var(--foreground)]">
              {translate('dashboard.goodMorning')}, {currentUser.displayName}!
            </h1>
            <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
              {meta
                ? `${translate(meta.labelKey as any)} • ${translate(meta.descriptionKey as any)}`
                : discipline}
            </p>
            <Link
              to="/curriculum/today"
              className="mt-5 inline-flex items-center gap-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {translate('dashboard.startHere')}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-lg"
            >
              <div className="mb-3 inline-flex rounded-[var(--radius-card)] bg-[var(--color-primary)]/10 p-2.5">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <p className="text-xs text-[var(--color-muted-copy)]">{label}</p>
              <p className="mt-1 text-lg font-bold text-[var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
