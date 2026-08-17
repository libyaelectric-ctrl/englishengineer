import { ArrowRight } from 'lucide-react';

import { useState } from 'react';

import { useLearningStore } from '@/core/learning';

import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
} from '@/shared/constants/engineering-disciplines';
import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';
import { getDisciplineIcon } from '@/shared/icons/registry';

import { useAuthStore } from '@/features/auth';
import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import type { TranslationKey } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/**
 * Mandatory first-run selection: the user must pick an engineering discipline
 * and an interface language before the app unlocks. Rendered as a centered,
 * login-style card (fixed overlay) until both are chosen.
 */
export const OnboardingPanel = () => {
  const translate = useLocalizationStore((state) => state.translate);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    if (!selectedDiscipline || !currentUser) return;
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in-50 duration-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-1.5 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {translate('onboarding.title')}
          </h1>
          <p className="text-sm text-muted-copy">{translate('onboarding.selectDisciplineDesc')}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 items-stretch">
          {/* Discipline Selection */}
          <section className="rounded-xl border border-border-soft bg-surface/70 p-4 flex flex-col justify-between h-full space-y-3">
            <div className="text-center space-y-0.5 pb-2 border-b border-border-soft/60">
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {translate('onboarding.selectDiscipline')}
              </h2>
              <p className="text-[11px] text-muted-copy">
                {translate('onboarding.selectDisciplineDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1 content-start">
              {ENGINEERING_DISCIPLINES.map((id) => {
                const Icon = getDisciplineIcon(id);
                const meta = DISCIPLINE_META[id];
                const isSelected = selectedDiscipline === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedDiscipline(id)}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border-soft bg-background/60 text-foreground hover:border-primary/50 hover:bg-surface-hover shadow-xs'
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border-soft bg-surface text-muted-copy'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold truncate leading-tight">
                        {translate(meta.labelKey as TranslationKey)}
                      </p>
                      <p className="text-[10px] text-muted-copy truncate leading-tight mt-0.5">
                        {translate(meta.descriptionKey as TranslationKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language Selection */}
          <section className="rounded-xl border border-border-soft bg-surface/70 p-4 flex flex-col justify-between h-full space-y-3">
            <div className="text-center space-y-0.5 pb-2 border-b border-border-soft/60">
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {translate('onboarding.selectLanguageTitle')}
              </h2>
              <p className="text-[11px] text-muted-copy">
                {translate('onboarding.selectLanguage')} (
                {translate('onboarding.englishFixedTarget')})
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 content-start overflow-y-auto max-h-[260px] sm:max-h-none pr-1 [scrollbar-width:thin]">
              {[
                ...INTERFACE_LANGUAGES.filter((l) => l.available && l.id !== 'en'),
                {
                  id: 'en' as SupportedInterfaceLanguage,
                  label: 'English',
                  nativeLabel: 'English',
                  available: true,
                  flag: 'EN',
                },
              ].map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                const isEnglish = lang.id === 'en';
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.id as SupportedInterfaceLanguage)}
                    className={`flex items-center sm:flex-col sm:justify-center gap-2 rounded-lg border p-2.5 text-left sm:text-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border-soft bg-background/60 text-foreground hover:border-primary/50 hover:bg-surface-hover shadow-xs'
                    }`}
                  >
                    {isEnglish ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-xs font-bold text-primary font-mono shrink-0">
                        EN
                      </span>
                    ) : (
                      <span className="text-xl sm:text-2xl leading-none shrink-0">{lang.flag}</span>
                    )}
                    <span className="text-[11px] font-semibold truncate leading-tight">
                      {lang.nativeLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!selectedDiscipline || isSaving}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all"
        >
          <span>{translate('onboarding.start')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPanel;
