import { ArrowRight, Globe } from 'lucide-react';

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

  const [step, setStep] = useState<'discipline' | 'language'>('discipline');
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage>('tr');

  const handleDisciplineSelect = (id: EngineeringDiscipline) => {
    setSelectedDiscipline(id);
  };

  const handleContinueToLanguage = () => {
    if (selectedDiscipline) {
      setStep('language');
    }
  };

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
      <div className="w-full max-w-2xl">
        {step === 'discipline' ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{translate('onboarding.selectDiscipline')}</h1>
              <p className="text-sm text-muted-copy">
                {translate('onboarding.selectDisciplineDesc')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ENGINEERING_DISCIPLINES.map((id) => {
                const Icon = getDisciplineIcon(id);
                const meta = DISCIPLINE_META[id];
                const isSelected = selectedDiscipline === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleDisciplineSelect(id)}
                    className={`flex items-center gap-3 rounded-[4px] border p-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border-soft bg-surface hover:border-primary/50'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-copy'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}
                      >
                        {translate(meta.labelKey as TranslationKey)}
                      </p>
                      <p className="text-xs text-muted-copy truncate">
                        {translate(meta.descriptionKey as TranslationKey)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinueToLanguage}
              disabled={!selectedDiscipline}
              className="w-full flex items-center justify-center gap-2 rounded-[4px] bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {translate('onboarding.continue')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Globe className="h-8 w-8 mx-auto text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{translate('onboarding.selectLanguageTitle')}</h1>
              <p className="text-sm text-muted-copy">{translate('onboarding.selectLanguage')}</p>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs text-muted-copy">{translate('onboarding.englishFixedTarget')}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {INTERFACE_LANGUAGES.filter((l) => l.available && l.id !== 'en').map((lang) => {
                const isSelected = selectedLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id as SupportedInterfaceLanguage)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-[4px] border p-4 text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary shadow-sm'
                        : 'border-border-soft bg-surface hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span
                      className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}
                    >
                      {lang.nativeLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('discipline')}
                className="flex-1 rounded-[4px] border border-border-soft bg-surface py-3 text-sm font-semibold text-foreground cursor-pointer transition-all hover:bg-surface-hover"
              >
                {translate('onboarding.back')}
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 flex items-center justify-center gap-2 rounded-[4px] bg-primary py-3 text-sm font-semibold text-primary-foreground cursor-pointer transition-all"
              >
                {translate('onboarding.start')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
