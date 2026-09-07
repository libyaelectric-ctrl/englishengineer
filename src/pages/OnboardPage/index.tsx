import { ArrowRight, Check, Moon, Sun } from 'lucide-react';

import { useCallback, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';
import { storage } from '@/shared/storage';
import type { CareerTrackId, InterfaceLanguage } from '@/shared/types/domain.types';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AUTH_SIGN_IN_URL } from '@/features/auth/firebase.config';
import {
  AVAILABLE_INTERFACE_LANGUAGES,
  useLocalizationStore,
} from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useTheme } from '@/features/theme/ThemeProvider';

export const consumePendingOnboard = () => {
  const pending = storage.globalGet('engvox-pending-onboard');
  if (pending) {
    storage.globalRemove('engvox-pending-onboard');
    return pending as { discipline: string; language: string };
  }
  return null;
};

const OnboardPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const translate = useLocalizationStore((s) => s.translate);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(
    null
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || saving) return;
    setSaving(true);
    try {
      if (currentUser) {
        setLanguage(selectedLanguage);
        await LearningProfileRepository.updatePreferences(currentUser.id, {
          discipline: selectedDiscipline,
          professionalTrack: selectedDiscipline as CareerTrackId,
          interfaceLanguage: selectedLanguage as InterfaceLanguage,
          onboardingCompleted: true,
        });
        useAuthStore.setState({
          currentUser: {
            ...useAuthStore.getState().currentUser!,
            engineeringDiscipline: selectedDiscipline,
          },
        });
        useLearningStore.getState().resetAll();
        navigate('/dashboard', { replace: true });
      } else {
        storage.globalSet('engvox-pending-onboard', {
          discipline: selectedDiscipline,
          language: selectedLanguage,
        });
        navigate(`${AUTH_SIGN_IN_URL}?redirect=/onboard`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, saving, currentUser, setLanguage, navigate]);

  const canFinish = Boolean(selectedDiscipline && selectedLanguage);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-4 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="rounded-button border border-border-soft px-3 py-1.5 text-sm text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
        >
          {translate('common.back')}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">EngVox</span>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-button border border-border-soft p-1.5 text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold">{translate('onboarding.title')}</h1>

        <section className="mt-8">
          <h2 className="text-base font-semibold">{translate('onboarding.selectDiscipline')}</h2>
          <p className="mt-1 text-sm text-muted-copy">
            {translate('onboarding.selectDisciplineDesc')}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {ENGINEERING_DISCIPLINES.map((id) => {
              const meta = DISCIPLINE_META[id];
              const Icon = getDisciplineIcon(id);
              const isSelected = selectedDiscipline === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedDiscipline(id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-start gap-3 rounded-card border p-3.5 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border-soft bg-surface hover:border-border-hover'
                  )}
                >
                  <Icon
                    className={cn(
                      'mt-0.5 h-5 w-5 shrink-0',
                      isSelected ? 'text-primary' : 'text-muted-copy'
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {translate(meta.labelKey)}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-copy">
                      {translate(meta.descriptionKey)}
                    </span>
                  </span>
                  {isSelected && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold">{translate('onboarding.selectLanguageTitle')}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {AVAILABLE_INTERFACE_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center gap-2 rounded-button border px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border-soft bg-surface text-foreground hover:border-border-hover'
                  )}
                >
                  <span aria-hidden="true">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0 z-20 flex justify-center border-t border-border-soft bg-background/95 p-4 backdrop-blur-md sm:p-6">
        <button
          onClick={() => void handleEnter()}
          disabled={!canFinish || saving}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-button px-8 py-3 text-sm font-semibold transition-colors sm:w-auto sm:px-12',
            canFinish
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'bg-surface-hover text-muted-copy'
          )}
        >
          <span>{saving ? translate('common.loading') : translate('onboarding.finish')}</span>
          {!saving && <ArrowRight size={18} />}
        </button>
      </footer>
    </div>
  );
};

export default OnboardPage;
