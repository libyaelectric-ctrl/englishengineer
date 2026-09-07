import { ArrowRight, Check, Loader2, Moon, Sun } from 'lucide-react';

import { useCallback, useRef, useState } from 'react';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const translate = useLocalizationStore((s) => s.translate);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const disciplineParam = searchParams.get('discipline');
  const languageParam = searchParams.get('lang');
  const initialDiscipline =
    disciplineParam && ENGINEERING_DISCIPLINES.includes(disciplineParam as EngineeringDiscipline)
      ? (disciplineParam as EngineeringDiscipline)
      : null;
  const initialLanguage =
    languageParam && AVAILABLE_INTERFACE_LANGUAGES.some((lang) => lang.id === languageParam)
      ? (languageParam as SupportedInterfaceLanguage)
      : null;

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(
    initialDiscipline
  );
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(
    initialLanguage
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectionHint, setSelectionHint] = useState<string | null>(null);

  const disciplineGroupRef = useRef<HTMLFieldSetElement>(null);
  const languageGroupRef = useRef<HTMLFieldSetElement>(null);

  const syncSelectionToUrl = useCallback(
    (next: {
      discipline?: EngineeringDiscipline | null;
      language?: SupportedInterfaceLanguage | null;
    }) => {
      const params = new URLSearchParams(searchParams);
      if (next.discipline !== undefined) {
        if (next.discipline) params.set('discipline', next.discipline);
        else params.delete('discipline');
      }
      if (next.language !== undefined) {
        if (next.language) params.set('lang', next.language);
        else params.delete('lang');
      }
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const selectDiscipline = (id: EngineeringDiscipline) => {
    setSelectedDiscipline(id);
    setSaveError(null);
    syncSelectionToUrl({ discipline: id });
    if (selectedLanguage) setSelectionHint(null);
  };

  const selectLanguage = (id: SupportedInterfaceLanguage) => {
    setSelectedLanguage(id);
    setSaveError(null);
    syncSelectionToUrl({ language: id });
    if (selectedDiscipline) setSelectionHint(null);
  };

  const handleEnter = useCallback(async () => {
    if (saving) return;
    if (!selectedDiscipline || !selectedLanguage) {
      setSaveError(null);
      setSelectionHint(translate('onboarding.missingSelection'));
      if (!selectedDiscipline) {
        disciplineGroupRef.current?.querySelector('input')?.focus();
      } else {
        languageGroupRef.current?.querySelector('input')?.focus();
      }
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSelectionHint(null);
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
    } catch {
      setSaveError(translate('onboarding.saveError'));
    } finally {
      setSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, saving, currentUser, setLanguage, navigate, translate]);

  const canFinish = Boolean(selectedDiscipline && selectedLanguage);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#onboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-pop"
      >
        {translate('common.skipToContent')}
      </a>
      <header className="flex items-center justify-between border-b border-border-soft px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="rounded-button border border-border-soft px-3 py-1.5 text-sm text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
        >
          {translate('common.back')}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">EngVox</span>
          <button
            onClick={toggleTheme}
            aria-label={translate('common.toggleTheme')}
            className="rounded-button border border-border-soft p-1.5 text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
          >
            {isDark ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
          </button>
        </div>
      </header>

      <main
        id="onboard-main"
        className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
      >
        <h1 className="text-2xl font-bold">{translate('onboarding.title')}</h1>

        <section className="mt-8">
          <h2 id="discipline-heading" className="text-base font-semibold">
            {translate('onboarding.selectDiscipline')}
          </h2>
          <p className="mt-1 text-sm text-muted-copy">
            {translate('onboarding.selectDisciplineDesc')}
          </p>
          <fieldset
            ref={disciplineGroupRef}
            aria-labelledby="discipline-heading"
            className="mt-4 grid gap-2 sm:grid-cols-2"
          >
            {ENGINEERING_DISCIPLINES.map((id) => {
              const meta = DISCIPLINE_META[id];
              const Icon = getDisciplineIcon(id);
              const isSelected = selectedDiscipline === id;
              return (
                <label
                  key={id}
                  className={cn(
                    'relative flex cursor-pointer items-start gap-3 rounded-card border p-3.5 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border-soft bg-surface hover:border-border-hover'
                  )}
                >
                  <input
                    type="radio"
                    name="discipline"
                    value={id}
                    checked={isSelected}
                    onChange={() => selectDiscipline(id)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <Icon
                    aria-hidden="true"
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
                  {isSelected && (
                    <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  )}
                </label>
              );
            })}
          </fieldset>
        </section>

        <section className="mt-8">
          <h2 id="language-heading" className="text-base font-semibold">
            {translate('onboarding.selectLanguageTitle')}
          </h2>
          <fieldset
            ref={languageGroupRef}
            aria-labelledby="language-heading"
            className="mt-4 flex flex-wrap gap-2"
          >
            {AVAILABLE_INTERFACE_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <label
                  key={lang.id}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-2 rounded-button border px-3 py-2 text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border-soft bg-surface text-foreground hover:border-border-hover'
                  )}
                >
                  <input
                    type="radio"
                    name="interface-language"
                    value={lang.id}
                    checked={isSelected}
                    onChange={() => selectLanguage(lang.id)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <span aria-hidden="true">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                </label>
              );
            })}
          </fieldset>
        </section>
      </main>

      <footer className="sticky bottom-0 z-20 flex flex-col items-center gap-2 border-t border-border-soft bg-background/95 p-4 backdrop-blur-md sm:p-6">
        {(selectionHint || saveError) && (
          <p
            role="alert"
            className={cn(
              'max-w-md text-center text-sm',
              saveError ? 'text-error' : 'text-muted-copy'
            )}
          >
            {saveError ?? selectionHint}
          </p>
        )}
        <button
          onClick={() => void handleEnter()}
          disabled={saving}
          aria-busy={saving}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-button px-8 py-3 text-sm font-semibold transition-colors sm:w-auto sm:px-12',
            canFinish
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'bg-surface-hover text-muted-copy'
          )}
        >
          {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
          <span>{translate('onboarding.finish')}</span>
          {!saving && canFinish && <ArrowRight aria-hidden="true" size={18} />}
        </button>
      </footer>
    </div>
  );
};

export default OnboardPage;
