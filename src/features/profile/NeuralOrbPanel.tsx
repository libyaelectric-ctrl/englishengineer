import { PRODUCT_VERSION } from '@/config/product.config';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { type ReactNode, type RefObject, useCallback, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { ThemeToggle } from '@/shared/components/ThemeToggle';
import {
  DISCIPLINE_META,
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/utils/cn';

import { useAuthStore } from '@/features/auth';
import { AVAILABLE_INTERFACE_LANGUAGES, useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';

/**
 * At or above Tailwind's `lg` the wizard keeps the two-pane desktop layout: both
 * lists side by side, one CTA. Below it the two lists are staged into steps — see
 * the note on `step` in the component for why.
 */
const TWO_PANE_QUERY = '(min-width: 1024px)';
const STEP_COUNT = 2;
const STEPS = [1, 2] as const;

type Step = (typeof STEPS)[number];
type Translate = (key: string) => string;

type ChoiceButtonProps = {
  selected: boolean;
  primary: string;
  secondary?: string;
  onClick: () => void;
  compact?: boolean;
};
const ChoiceButton = ({
  selected,
  primary,
  secondary,
  onClick,
  compact = false,
}: ChoiceButtonProps) => (
  <button
    type="button"
    data-onboarding-choice="true"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'flex w-full items-center justify-between gap-2 rounded-[var(--radius-button)] border text-left transition-all',
      compact ? 'h-[3.35rem] px-3' : 'h-[4.35rem] px-4',
      selected
        ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary/20'
        : 'border-border-soft bg-surface text-foreground hover:border-primary/40 hover:bg-surface-hover'
    )}
  >
    <span className="min-w-0 flex-1">
      {/* Compact tiles are ~165px wide on a phone, where a single-line ellipsis cut
          real names ("Elektrik Mühendisliği", "Mekatronik Mühendisliği"). The name
          wraps to a second line instead; only the supplementary line is ellipsised. */}
      <span
        className={cn(
          'font-black leading-tight text-foreground',
          compact ? 'line-clamp-2 text-xs' : 'block truncate text-sm'
        )}
      >
        {primary}
      </span>
      {secondary && (
        <span
          className={cn(
            'mt-0.5 font-semibold text-muted-copy',
            compact ? 'line-clamp-1 text-[10px] leading-tight' : 'block truncate text-xs'
          )}
        >
          {secondary}
        </span>
      )}
    </span>
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border',
        compact ? 'h-5 w-5' : 'h-6 w-6',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border-soft text-transparent'
      )}
    >
      <Check className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
    </span>
  </button>
);

type ChoiceGridProps<T extends string> = {
  items: { id: T; primary: string; secondary?: string }[];
  selectedId: T | null;
  onSelect: (id: T) => void;
  compact?: boolean;
  columns?: string;
};
function ChoiceGrid<T extends string>({
  items,
  selectedId,
  onSelect,
  compact = false,
  columns = 'grid-cols-2',
}: ChoiceGridProps<T>) {
  return (
    <div className={cn('grid gap-2', columns)}>
      {items.map((item) => (
        <ChoiceButton
          key={item.id}
          compact={compact}
          selected={selectedId === item.id}
          primary={item.primary}
          secondary={item.secondary}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}

const SectionCard = ({
  title,
  value,
  headingRef,
  children,
}: {
  title: string;
  value: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) => (
  <section className="min-h-0 rounded-[var(--radius-card)] border border-border-soft bg-background p-3">
    <div className="mb-3 flex items-center justify-between gap-2">
      {/* Focus target after a step change: focus lands here so screen readers
          announce the new step instead of silently swapping the panel. */}
      <h2
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className="text-sm font-black text-foreground outline-none"
      >
        {title}
      </h2>
      <span className="shrink-0 text-xs font-bold text-muted-copy">{value}</span>
    </div>
    {children}
  </section>
);

/**
 * Step indicator for narrow viewports. The completed step is a button (one tap
 * back); the current step carries `aria-current="step"` and the pending one is
 * inert, so the control never advertises a move the wizard will not take.
 */
const StepChips = ({
  step,
  labels,
  ariaLabel,
  onGoToStep,
}: {
  step: Step;
  labels: Record<Step, string>;
  ariaLabel: string;
  onGoToStep: (step: Step) => void;
}) => (
  <ol aria-label={ariaLabel} className="grid grid-cols-2 gap-2">
    {STEPS.map((value) => {
      const isActive = step === value;
      const isDone = step > value;
      const chipClass = cn(
        'flex h-10 w-full items-center gap-2 rounded-[var(--radius-button)] border px-3 text-xs font-black transition',
        isActive
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border-soft bg-background text-muted-copy'
      );
      const content = (
        <>
          <span
            aria-hidden
            className={cn(
              'grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-black',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : isDone
                  ? 'border-primary/50 text-primary'
                  : 'border-border-soft text-muted-copy'
            )}
          >
            {isDone ? <Check className="h-3 w-3" /> : value}
          </span>
          <span className="min-w-0 truncate">{labels[value]}</span>
        </>
      );
      return (
        <li key={value} className="min-w-0" aria-current={isActive ? 'step' : undefined}>
          {isDone ? (
            <button
              type="button"
              onClick={() => onGoToStep(value)}
              className={cn(chipClass, 'hover:bg-surface-hover hover:text-foreground')}
            >
              {content}
            </button>
          ) : (
            <div className={chipClass}>{content}</div>
          )}
        </li>
      );
    })}
  </ol>
);

const FooterBar = ({ children }: { children: ReactNode }) => (
  <footer className="relative z-10 flex h-14 shrink-0 items-center justify-between border-t border-border-soft bg-background/92 px-4 backdrop-blur-xl sm:px-6">
    {children}
  </footer>
);

const PrimaryButton = ({
  label,
  enabled,
  icon,
  onClick,
}: {
  label: string;
  enabled: boolean;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    data-onboarding-primary="true"
    onClick={onClick}
    disabled={!enabled}
    className={cn(
      'ml-3 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-button)] px-5 text-sm font-black transition-all',
      enabled
        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
        : 'bg-surface-hover text-muted-copy'
    )}
  >
    <span>{label}</span>
    {enabled && icon}
  </button>
);

/** One choice list, as the body needs it in either layout. */
type SectionSpec<T extends string> = {
  title: string;
  value: string;
  items: { id: T; primary: string; secondary: string }[];
  selected: T | null;
  onSelect: (id: T) => void;
};

const WizardBody = ({
  isTwoPane,
  step,
  title,
  eyebrow,
  stepOfLabel,
  stepLabels,
  onGoToStep,
  headingRef,
  discipline,
  language,
}: {
  isTwoPane: boolean;
  step: Step;
  title: string;
  eyebrow: string;
  stepOfLabel: string;
  stepLabels: Record<Step, string>;
  onGoToStep: (step: Step) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  discipline: SectionSpec<EngineeringDiscipline>;
  language: SectionSpec<SupportedInterfaceLanguage>;
}) => (
  <>
    <div className="mb-3 shrink-0 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h1 className="mt-1 text-[clamp(1.4rem,2.8vw,2.55rem)] font-black leading-none tracking-tight text-foreground">
        {title}
      </h1>
    </div>
    {isTwoPane ? (
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
        <SectionCard title={discipline.title} value={discipline.value}>
          <ChoiceGrid
            items={discipline.items}
            selectedId={discipline.selected}
            onSelect={discipline.onSelect}
          />
        </SectionCard>
        <SectionCard title={language.title} value={language.value}>
          <ChoiceGrid
            items={language.items}
            selectedId={language.selected}
            onSelect={language.onSelect}
            compact
            columns="grid-cols-3"
          />
        </SectionCard>
      </div>
    ) : (
      <>
        <div className="mb-3 shrink-0">
          <StepChips
            step={step}
            labels={stepLabels}
            ariaLabel={stepOfLabel}
            onGoToStep={onGoToStep}
          />
        </div>
        {/* Narrow: both steps use the compact two-column grid — that is what lets
            ten (and fifteen) tiles each fit one screen instead of scrolling behind
            the other list. */}
        <div className="min-h-0 flex-1">
          {step === 1 ? (
            <SectionCard title={discipline.title} value={discipline.value} headingRef={headingRef}>
              <ChoiceGrid
                items={discipline.items}
                selectedId={discipline.selected}
                onSelect={discipline.onSelect}
                compact
              />
            </SectionCard>
          ) : (
            <SectionCard title={language.title} value={language.value} headingRef={headingRef}>
              <ChoiceGrid
                items={language.items}
                selectedId={language.selected}
                onSelect={language.onSelect}
                compact
              />
            </SectionCard>
          )}
        </div>
      </>
    )}
  </>
);

const stepCtaLabel = (step: Step, isSaving: boolean, translate: Translate): string =>
  isSaving
    ? translate('common.loading')
    : step === 1
      ? translate('onboarding.continue')
      : translate('onboarding.finish');

const stagedFooterLabel = (
  step: Step,
  canFinish: boolean,
  disciplineLabel: string,
  translate: Translate
): string => (step === 2 && !canFinish ? translate('onboarding.selectLanguage') : disciplineLabel);

const stepOfLabel = (step: Step, translate: Translate): string =>
  translate('onboarding.stepOf')
    .replace('{current}', String(step))
    .replace('{total}', String(STEP_COUNT));

/** Two-pane footer: a one-line summary plus the single "next" CTA. */
const TwoPaneFooter = ({
  disciplineLabel,
  languageLabel,
  ctaLabel,
  enabled,
  onFinish,
}: {
  disciplineLabel: string;
  languageLabel: string;
  ctaLabel: string;
  enabled: boolean;
  onFinish: () => void;
}) => (
  <FooterBar>
    <p className="truncate text-sm font-bold text-muted-copy">
      {disciplineLabel} · {languageLabel}
    </p>
    <PrimaryButton
      label={ctaLabel}
      enabled={enabled}
      icon={<ArrowRight className="h-4 w-4" />}
      onClick={onFinish}
    />
  </FooterBar>
);

/**
 * Staged footer: the line states what is still missing (or, on step 2, which
 * discipline was chosen), and the CTA advances on step 1 but finishes on step 2 —
 * step 1 must never be able to save a half-answered wizard.
 */
const StagedFooter = ({
  step,
  isSaving,
  hasDiscipline,
  canFinish,
  disciplineLabel,
  translate,
  onAdvance,
  onFinish,
}: {
  step: Step;
  isSaving: boolean;
  hasDiscipline: boolean;
  canFinish: boolean;
  disciplineLabel: string;
  translate: Translate;
  onAdvance: () => void;
  onFinish: () => void;
}) => (
  <FooterBar>
    <p className="min-w-0 flex-1 truncate text-xs font-bold text-muted-copy">
      {stagedFooterLabel(step, canFinish, disciplineLabel, translate)}
    </p>
    <PrimaryButton
      label={stepCtaLabel(step, isSaving, translate)}
      enabled={step === 1 ? hasDiscipline : canFinish && !isSaving}
      icon={step === 1 ? <ArrowRight className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      onClick={step === 1 ? onAdvance : onFinish}
    />
  </FooterBar>
);

export const NeuralOrbPanel = ({ onComplete }: { onComplete?: () => void } = {}) => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const currentLanguage = useLocalizationStore((s) => s.language);
  const setLanguage = useLocalizationStore((s) => s.setLanguage);
  const currentUser = useAuthStore((s) => s.currentUser);
  const languageOptions = useMemo(() => AVAILABLE_INTERFACE_LANGUAGES, []);
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedInterfaceLanguage | null>(
    currentLanguage as SupportedInterfaceLanguage | null
  );
  const [isSaving, setIsSaving] = useState(false);
  // Narrow viewports stage the two lists into steps. Stacked, ten disciplines plus
  // fifteen languages made one long page whose tail (every language) started below
  // the fold on a phone, so a required choice stayed invisible until the user had
  // scrolled past a list they had already answered (docs/TECH_DEBT.md, TD-026).
  const [step, setStep] = useState<Step>(1);
  const isTwoPane = useMediaQuery(TWO_PANE_QUERY);
  const paneRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const goToStep = useCallback((next: Step) => {
    setStep(next);
    // Reset the scroll region and hand keyboard/screen-reader focus to the step's
    // heading; otherwise focus stays on the control that unmounted with the step.
    requestAnimationFrame(() => {
      if (paneRef.current) paneRef.current.scrollTop = 0;
      headingRef.current?.focus();
    });
  }, []);

  const handleSelectLanguage = (id: SupportedInterfaceLanguage) => {
    setSelectedLanguage(id);
    setLanguage(id);
  };

  const canFinish = Boolean(selectedDiscipline && selectedLanguage && currentUser);
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
      if (onComplete) onComplete();
      else navigate('/dashboard', { replace: true });
    } finally {
      setIsSaving(false);
    }
  }, [selectedDiscipline, selectedLanguage, currentUser, isSaving, onComplete, navigate]);

  const disciplineMeta = selectedDiscipline ? DISCIPLINE_META[selectedDiscipline] : null;
  const disciplineLabel = disciplineMeta
    ? translate(disciplineMeta.labelKey)
    : translate('onboarding.selectDiscipline');
  const languageMeta = selectedLanguage
    ? languageOptions.find((l) => l.id === selectedLanguage)
    : null;
  const languageLabel = languageMeta
    ? languageMeta.nativeLabel
    : translate('onboarding.selectLanguageTitle');
  const discipline: SectionSpec<EngineeringDiscipline> = {
    title: translate('onboarding.selectDiscipline'),
    value: disciplineMeta ? disciplineLabel : '—',
    items: ENGINEERING_DISCIPLINES.map((id) => ({
      id,
      primary: translate(DISCIPLINE_META[id].labelKey),
      secondary: translate(DISCIPLINE_META[id].descriptionKey),
    })),
    selected: selectedDiscipline,
    onSelect: setSelectedDiscipline,
  };
  const language: SectionSpec<SupportedInterfaceLanguage> = {
    title: translate('onboarding.selectLanguageTitle'),
    value: languageMeta ? languageLabel : '—',
    items: languageOptions.map((option) => ({
      id: option.id,
      primary: `${option.flag} ${option.nativeLabel}`,
      secondary: option.label,
    })),
    selected: selectedLanguage,
    onSelect: handleSelectLanguage,
  };
  const stepLegend = stepOfLabel(step, translate);
  const stepLabels: Record<Step, string> = {
    1: translate('onboarding.yourDiscipline'),
    2: translate('onboarding.interfaceLanguage'),
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background text-foreground">
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-border-soft bg-background/92 px-4 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-button)] border border-border-soft bg-surface px-3 text-sm font-black text-muted-copy transition hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {translate('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <img
            src="/brand/logo.svg"
            alt="EngVox"
            className="h-8 w-8 rounded-[var(--radius-button)]"
          />
          <span className="text-xs font-black text-primary">v{PRODUCT_VERSION}</span>
        </div>
      </header>
      {/* One scroll region for the whole panel. The two sections used to be squeezed into a
          fixed height at every width, so at phone widths the discipline grid overflowed and the
          language section painted over its lower half: a tap on "Software Engineering" landed
          on a language button instead. Below `lg` each step now holds a single list, so this
          pane only scrolls when that list itself is taller than the viewport. */}
      <main
        ref={paneRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6"
      >
        <div className="mx-auto flex min-h-full max-w-7xl flex-col rounded-[var(--radius-dialog)] border border-border-soft bg-surface p-3 shadow-card sm:p-4">
          <WizardBody
            isTwoPane={isTwoPane}
            step={step}
            title={translate('onboarding.title')}
            eyebrow={isTwoPane ? translate('login.onboarding') : stepLegend}
            stepOfLabel={stepLegend}
            stepLabels={stepLabels}
            onGoToStep={goToStep}
            headingRef={headingRef}
            discipline={discipline}
            language={language}
          />
        </div>
      </main>
      {isTwoPane ? (
        <TwoPaneFooter
          disciplineLabel={disciplineLabel}
          languageLabel={languageLabel}
          ctaLabel={isSaving ? translate('common.loading') : translate('common.next')}
          enabled={canFinish && !isSaving}
          onFinish={() => void handleEnter()}
        />
      ) : (
        <StagedFooter
          step={step}
          isSaving={isSaving}
          hasDiscipline={Boolean(selectedDiscipline)}
          canFinish={canFinish}
          disciplineLabel={disciplineLabel}
          translate={translate}
          onAdvance={() => goToStep(2)}
          onFinish={() => void handleEnter()}
        />
      )}
    </div>
  );
};
export default NeuralOrbPanel;
