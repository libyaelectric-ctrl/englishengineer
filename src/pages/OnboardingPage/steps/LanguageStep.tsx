import { INTERFACE_LANGUAGES } from '@/features/localization';
import type { InterfaceLanguage } from '@/features/profile/profile.types';

type LanguageStepProps = {
  language: InterfaceLanguage;
  setLanguage: (l: InterfaceLanguage) => void;
};

export const LanguageStep = ({ language, setLanguage }: LanguageStepProps) => (
  <section>
    <h2 className="text-xl font-medium">Select your interface language</h2>
    <p className="mt-2 text-sm text-muted-copy">
      The platform interface and vocabulary translations will appear in this language.
    </p>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {INTERFACE_LANGUAGES.map((lang) => {
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
                <p className="mt-1 text-[10px] font-medium text-muted-copy/70">Coming Soon</p>
              )}
            </div>
            {isSelected && <div className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  </section>
);
