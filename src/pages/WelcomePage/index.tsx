import { ArrowRight } from 'lucide-react';

import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

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

export const WelcomeScreen = () => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((state) => state.translate);
  const setLanguage = useLocalizationStore((state) => state.setLanguage);
  const currentUser = useAuthStore((state) => state.currentUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');

  const handleFinish = async () => {
    if (selectedDiscipline && currentUser) {
      setLanguage(selectedLanguage);
      await updateProfile({
        engineeringDiscipline: selectedDiscipline,
      });
      LearningProfileRepository.updatePreferences(currentUser.id, {
        discipline: selectedDiscipline,
        onboardingCompleted: true,
        interfaceLanguage: selectedLanguage,
      });
      useLearningStore.getState().resetAll();
      navigate('/curriculum', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{translate('onboarding.title')}</h1>
          <p className="text-sm text-muted-copy">{translate('onboarding.selectDisciplineDesc')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          {/* Left Column: Discipline Selection */}
          <section className="rounded-xl border border-border-soft bg-surface/70 backdrop-blur-sm p-5 shadow-sm flex flex-col justify-between h-full space-y-4">
            <div className="text-center space-y-1 pb-1 border-b border-border-soft/60">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {translate('onboarding.selectDiscipline')}
              </h2>
              <p className="text-xs text-muted-copy">
                {translate('onboarding.selectDisciplineDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1 content-start">
              {ENGINEERING_DISCIPLINES.map((id) => {
                const Icon = getDisciplineIcon(id);
                const meta = DISCIPLINE_META[id];
                const isSelected = selectedDiscipline === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedDiscipline(id)}
                    className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border-soft bg-background/60 text-foreground hover:border-primary/50 hover:bg-surface-hover shadow-2xs'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border-soft bg-surface text-muted-copy'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate leading-tight">
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

          {/* Right Column: Language Selection */}
          <section className="rounded-xl border border-border-soft bg-surface/70 backdrop-blur-sm p-5 shadow-sm flex flex-col justify-between h-full space-y-4">
            <div className="text-center space-y-1 pb-1 border-b border-border-soft/60">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {translate('onboarding.selectLanguageTitle')}
              </h2>
              <p className="text-xs text-muted-copy">
                {translate('onboarding.selectLanguage')} (
                {translate('onboarding.englishFixedTarget')})
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1 content-start overflow-y-auto max-h-[380px] sm:max-h-none pr-1 [scrollbar-width:thin]">
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
                    className={`flex items-center sm:flex-col sm:justify-center gap-2 rounded-lg border p-3 text-left sm:text-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                        : 'border-border-soft bg-background/60 text-foreground hover:border-primary/50 hover:bg-surface-hover shadow-2xs'
                    }`}
                  >
                    {isEnglish ? (
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-primary/10 border border-primary/20 text-xs sm:text-sm font-bold text-primary font-mono shrink-0">
                        EN
                      </span>
                    ) : (
                      <span className="text-xl sm:text-2xl leading-none shrink-0">{lang.flag}</span>
                    )}
                    <span className="text-xs font-semibold truncate leading-tight">
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
          disabled={!selectedDiscipline}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all"
        >
          <span>{translate('onboarding.start')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
