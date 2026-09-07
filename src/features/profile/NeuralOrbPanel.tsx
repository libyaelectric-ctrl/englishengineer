import { ArrowRight, Check } from 'lucide-react';

import { useCallback, useState } from 'react';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/**
 * Gates the app until the user has picked an engineering discipline and an
 * interface language (see OnboardingGate). Deliberately static — no canvas,
 * no animation loop — so it reads clearly and matches the sign-in page's
 * card style instead of competing with it.
 */
export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const translate = useLocalizationStore((s) => s.translate);
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(
    null
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedInterfaceLanguage>(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  const canFinish = Boolean(selectedDiscipline && selectedLanguage && currentUser);

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || !currentUser || isSaving) return;
    setIsSaving(true);
    try {
      setLanguage(selectedLanguage);
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline: selectedDiscipline,
        professionalTrack: selectedDiscipline as never,
        onboardingCompleted: true,
        interfaceLanguage: selectedLanguage,
      });
      useAuthStore.setState({
        currentUser: {
          ...useAuthStore.getState().currentUser!,
          engineeringDiscipline: selectedDiscipline,
        },
      });
      useLearningStore.getState().resetAll();
      onComplete?.();
    } finally {
      setIsSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, currentUser, isSaving, setLanguage, onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl rounded-card border border-border-soft bg-surface p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-bold text-foreground">{translate('onboarding.title')}</h1>

        <section className="mt-6">
          <h2 className="text-base font-semibold text-foreground">
            {translate('onboarding.selectDiscipline')}
          </h2>
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

        <section className="mt-6">
          <h2 className="text-base font-semibold text-foreground">
            {translate('onboarding.selectLanguageTitle')}
          </h2>
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

        <div className="mt-8 flex justify-end border-t border-border-soft pt-5">
          <button
            type="button"
            onClick={() => void handleEnter()}
            disabled={!canFinish || isSaving}
            className={cn(
              'flex items-center justify-center gap-2 rounded-button px-8 py-3 text-sm font-semibold transition-colors',
              canFinish
                ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                : 'bg-surface-hover text-muted-copy'
            )}
          >
            <span>{isSaving ? translate('common.loading') : translate('onboarding.finish')}</span>
            {!isSaving && <ArrowRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeuralOrbPanel;
