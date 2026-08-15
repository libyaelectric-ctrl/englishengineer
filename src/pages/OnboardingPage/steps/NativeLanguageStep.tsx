import { INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';

type NativeLanguageStepProps = {
  language: SupportedInterfaceLanguage;
  setLanguage: (l: SupportedInterfaceLanguage) => void;
};

export const NativeLanguageStep = ({ language, setLanguage }: NativeLanguageStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.nativeLanguageTitle')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.nativeLanguageDesc')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {INTERFACE_LANGUAGES.filter((lang) => lang.id !== 'en').map((lang) => {
          const isSelected = language === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => lang.available && setLanguage(lang.id)}
              disabled={!lang.available}
              className={`flex items-center gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : lang.available
                    ? 'border-border-soft bg-surface hover:border-border-hover hover:bg-surface-hover'
                    : 'border-border-soft bg-surface opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
                >
                  {lang.nativeLabel}
                </p>
                <p className="mt-0.5 text-xs text-muted-copy">{lang.label}</p>
                {!lang.available && (
                  <p className="mt-1 text-[10px] font-medium text-muted-copy/70">
                    {translate('onboarding.comingSoon')}
                  </p>
                )}
              </div>
              {isSelected && (
                <div className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};