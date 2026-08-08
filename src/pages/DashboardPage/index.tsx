import React, { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-copy">Yükleniyor...</p>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-muted-copy">{translate('dashboard.commandCenter')}</p>
          <h1 className="text-2xl font-bold text-foreground">
            {translate('dashboard.goodMorning')}, {currentUser.displayName}!
          </h1>
          <p className="text-sm text-muted-copy">
            {meta
              ? `${translate(meta.labelKey as any)} • ${translate(meta.descriptionKey as any)}`
              : discipline}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <p className="text-xs text-muted-copy">{translate('dashboard.myDiscipline')}</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {meta ? translate(meta.labelKey as any) : discipline}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <p className="text-xs text-muted-copy">{translate('dashboard.targetLevel')}</p>
            <p className="text-lg font-semibold text-foreground mt-1">A1 → C2</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <p className="text-xs text-muted-copy">{translate('curriculum.active')}</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {learningState.missions?.filter((m) => m.status === 'active').length || 0}{' '}
              {translate('curriculum.items')}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <p className="text-xs text-muted-copy">{translate('dashboard.level')}</p>
            <p className="text-lg font-semibold text-foreground mt-1">A1</p>
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground mb-2">
            {translate('dashboard.startHere')}
          </h2>
          <p className="text-sm text-muted-copy mb-4">{translate('dashboard.continueLesson')}</p>
          <div className="flex gap-3">
            
            <button
              onClick={() => navigate('/vocabulary')}
              className="rounded-lg border border-border-soft px-4 py-2 text-sm font-semibold text-foreground cursor-pointer hover:bg-surface-hover"
            >
              {translate('vocabulary.title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


