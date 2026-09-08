import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

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

interface DisciplineRowProps {
  id: EngineeringDiscipline;
  isSelected: boolean;
  onSelect: (id: EngineeringDiscipline) => void;
  translate: (key: string) => string;
}

const DisciplineRow = ({ id, isSelected, onSelect, translate }: DisciplineRowProps) => {
  const meta = DISCIPLINE_META[id];
  const Icon = getDisciplineIcon(id);
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      className={cn(
        'flex w-full items-center gap-3 rounded-button border p-2.5 text-left transition-colors',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border-soft bg-surface hover:border-border-hover'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', isSelected ? 'text-primary' : 'text-muted-copy')} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-tight text-foreground">
          {translate(meta.labelKey)}
        </span>
        <span className="block truncate text-xs leading-tight text-muted-copy">
          {translate(meta.descriptionKey)}
        </span>
      </span>
      {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
};

interface LanguageRowProps {
  lang: (typeof AVAILABLE_INTERFACE_LANGUAGES)[number];
  isSelected: boolean;
  onSelect: (id: SupportedInterfaceLanguage) => void;
}

const LanguageRow = ({ lang, isSelected, onSelect }: LanguageRowProps) => (
  <button
    type="button"
    onClick={() => onSelect(lang.id)}
    aria-pressed={isSelected}
    className={cn(
      'flex w-full items-center gap-3 rounded-button border p-2.5 text-left transition-colors',
      isSelected
        ? 'border-primary bg-primary/5'
        : 'border-border-soft bg-surface hover:border-border-hover'
    )}
  >
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none"
      aria-hidden="true"
    >
      {lang.flag}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium leading-tight text-foreground">
        {lang.nativeLabel}
      </span>
      <span className="block truncate text-xs leading-tight text-muted-copy">{lang.label}</span>
    </span>
    {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
  </button>
);

interface SummaryStepProps {
  done: boolean;
  step: number;
  label: string;
}

const SummaryStep = ({ done, step, label }: SummaryStepProps) => (
  <div className="flex min-w-0 items-center gap-2">
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]',
        done
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border-soft text-muted-copy'
      )}
    >
      {done ? <Check className="h-3 w-3" /> : step}
    </span>
    <span className="truncate text-sm text-foreground">{label}</span>
  </div>
);

/**
 * Gates the app until the user has picked an engineering discipline and an
 * interface language (see OnboardingGate). Single static viewport — no
 * canvas, no animation loop, no page scroll — so it reads clearly and
 * matches the sign-in page's card style instead of competing with it.
 */
export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);

  // English is the language being taught, not an interface option here.
  const languageOptions = useMemo(
    () => AVAILABLE_INTERFACE_LANGUAGES.filter((lang) => lang.id !== 'en'),
    []
  );

  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(
    currentLanguage !== 'en' ? currentLanguage : null
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectLanguage = (id: SupportedInterfaceLanguage) => {
    setSelectedLanguage(id);
    // Live preview: the whole page (and app) switches immediately, not just
    // on confirm — same as any ordinary language switcher.
    setLanguage(id);
  };

  const canFinish = Boolean(selectedDiscipline && selectedLanguage && currentUser);

  const handleBack = () => navigate('/');

  const handleEnter = useCallback(async () => {
    if (!selectedDiscipline || !selectedLanguage || !currentUser || isSaving) return;
    setIsSaving(true);
    try {
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
      if (onComplete) {
        onComplete();
      } else {
        // Standalone route (e.g. /onboarding): the picker is the entry
        // point, so send the user into the gated app once it completes.
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, currentUser, isSaving, onComplete, navigate]);

  const disciplineMeta = selectedDiscipline ? DISCIPLINE_META[selectedDiscipline] : null;
  const languageMeta = selectedLanguage
    ? languageOptions.find((l) => l.id === selectedLanguage)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
      {/* Header — brand + version, always visible, never scrolls */}
      <header className="flex shrink-0 items-center justify-between border-b border-border-soft px-4 py-3 sm:px-6">
        <img src="/brand/logo.svg" alt="EngVox" className="h-7" />
        <span className="text-xs text-muted-copy">EngVox v{PRODUCT_VERSION}</span>
      </header>

      {/* Body — the only area that may scroll internally; the page itself does not */}
      <main className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-full max-w-4xl flex-col">
          <h1 className="shrink-0 text-lg font-bold text-foreground sm:text-xl">
            {translate('onboarding.title')}
          </h1>

          <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Discipline frame */}
            <section className="flex min-h-0 flex-col rounded-card border border-border-soft bg-surface p-4">
              <h2 className="shrink-0 text-sm font-semibold text-foreground">
                {translate('onboarding.selectDiscipline')}
              </h2>
              <p className="mt-1 shrink-0 text-xs text-muted-copy">
                {translate('onboarding.selectDisciplineDesc')}
              </p>
              <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {ENGINEERING_DISCIPLINES.map((id) => (
                  <DisciplineRow
                    key={id}
                    id={id}
                    isSelected={selectedDiscipline === id}
                    onSelect={setSelectedDiscipline}
                    translate={translate}
                  />
                ))}
              </div>
            </section>

            {/* Language frame — same row size/shape as discipline frame */}
            <section className="flex min-h-0 flex-col rounded-card border border-border-soft bg-surface p-4">
              <h2 className="shrink-0 text-sm font-semibold text-foreground">
                {translate('onboarding.selectLanguageTitle')}
              </h2>
              <p className="mt-1 shrink-0 text-xs text-muted-copy">
                {translate('onboarding.selectLanguage')}
              </p>
              <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {languageOptions.map((lang) => (
                  <LanguageRow
                    key={lang.id}
                    lang={lang}
                    isSelected={selectedLanguage === lang.id}
                    onSelect={handleSelectLanguage}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Selections + progress summary — ties the page together */}
          <div className="mt-4 flex shrink-0 items-center justify-between gap-4 rounded-card border border-border-soft bg-surface px-4 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <SummaryStep
                done={Boolean(disciplineMeta)}
                step={1}
                label={
                  disciplineMeta
                    ? translate(disciplineMeta.labelKey)
                    : translate('onboarding.selectDiscipline')
                }
              />
              <SummaryStep
                done={Boolean(languageMeta)}
                step={2}
                label={
                  languageMeta
                    ? languageMeta.nativeLabel
                    : translate('onboarding.selectLanguageTitle')
                }
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer — Back to landing / Forward into the app, always visible */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border-soft px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-button border border-border-soft px-4 py-2.5 text-sm font-medium text-muted-copy transition-colors hover:border-border-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{translate('common.back')}</span>
        </button>
        <button
          type="button"
          onClick={() => void handleEnter()}
          disabled={!canFinish || isSaving}
          className={cn(
            'flex items-center justify-center gap-2 rounded-button px-6 py-2.5 text-sm font-semibold transition-colors',
            canFinish
              ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
              : 'bg-surface-hover text-muted-copy'
          )}
        >
          <span>{isSaving ? translate('common.loading') : translate('common.next')}</span>
          {!isSaving && <ArrowRight className="h-4 w-4" />}
        </button>
      </footer>
    </div>
  );
};

export default NeuralOrbPanel;
