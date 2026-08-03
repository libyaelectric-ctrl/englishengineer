import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

import { useMemo, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import type { SupportedInterfaceLanguage } from '@/features/localization/localization.types';
import { PlacementService } from '@/features/placement';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import type { SelfReportedCefr, SkillName } from '@/features/profile/profile.types';

import { DisciplineStep } from './steps/DisciplineStep';
import { LanguageStep } from './steps/LanguageStep';
import { LevelStep } from './steps/LevelStep';
import { PlanStep } from './steps/PlanStep';

const STEPS = ['discipline', 'language', 'level', 'plan'] as const;
type Step = (typeof STEPS)[number];

const labels: Record<Step, string> = {
  discipline: 'Your discipline',
  language: 'Interface language',
  level: 'Starting point',
  plan: 'Plan',
};

const parseStep = (pathname: string): Step => {
  const routeStep = pathname.split('/').at(-1);
  return STEPS.includes(routeStep as Step) ? (routeStep as Step) : 'discipline';
};

const OnboardingFooter = ({
  index,
  save,
  isLiteMode,
  exploreLiteAtA1,
  continueFlow,
}: {
  index: number;
  save: () => void;
  isLiteMode: boolean;
  exploreLiteAtA1: () => void;
  continueFlow: () => void;
}) => (
  <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft bg-surface-hover px-4 py-4 sm:px-7">
    {index > 0 ? (
      <Link
        to={`/onboarding/${STEPS[index - 1]}`}
        onClick={() => save()}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
    ) : (
      <span />
    )}
    <div className="flex flex-wrap items-center justify-end gap-2">
      {isLiteMode && (
        <button
          type="button"
          onClick={exploreLiteAtA1}
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted-copy hover:bg-surface"
        >
          Explore now at A1
        </button>
      )}
      <button
        type="button"
        onClick={continueFlow}
        className="public-primary-action min-w-0 px-4 sm:px-5 rounded-lg font-medium"
      >
        {index === STEPS.length - 1 ? 'Continue to placement' : 'Continue'}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  </footer>
);

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { translate } = useLocalizationStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? 'local-user';
  const initial = useMemo(() => LearningProfileRepository.getProfile(userId), [userId]);
  const step = parseStep(location.pathname);
  const index = STEPS.indexOf(step);

  const [discipline, setDiscipline] = useState<EngineeringDiscipline>(initial.discipline);
  const [interfaceLanguage, setInterfaceLanguage] = useState<SupportedInterfaceLanguage>(
    initial.interfaceLanguage as SupportedInterfaceLanguage
  );
  const [selfReportedCefr, setSelfReportedCefr] = useState<SelfReportedCefr>(
    initial.selfReportedCefr
  );
  const [selectedPlan, setSelectedPlan] = useState(initial.selectedPlan);
  const isLiteMode = new URLSearchParams(location.search).get('mode') === 'lite';

  const save = (complete = false) => {
    LearningProfileRepository.updatePreferences(userId, {
      discipline,
      professionalTrack: discipline as never,
      interfaceLanguage: interfaceLanguage as never,
      selfReportedCefr,
      selectedPlan,
      learningFocus: [] as SkillName[],
      onboardingCompleted: complete,
    });
  };

  const navigateNext = () => {
    navigate(`/onboarding/${STEPS[index + 1]}`);
  };

  const navigateFinal = () => {
    ProductAnalyticsService.track('onboarding_completed', '/onboarding/plan', {
      metadata: { plan: selectedPlan, source: 'user' },
    });
    navigate(initial.placementCompleted ? '/curriculum' : '/placement', {
      replace: true,
    });
  };

  const continueFlow = () => {
    const complete = index === STEPS.length - 1;
    save(complete);
    if (!complete) {
      navigateNext();
      return;
    }
    navigateFinal();
  };

  const exploreLiteAtA1 = () => {
    save(true);
    PlacementService.startAtA1(userId);
    navigate('/curriculum', { replace: true });
  };

  const StepContent = () => {
    if (step === 'discipline') {
      return <DisciplineStep discipline={discipline} setDiscipline={setDiscipline} />;
    }
    if (step === 'language') {
      return <LanguageStep language={interfaceLanguage} setLanguage={setInterfaceLanguage} />;
    }
    if (step === 'level') {
      return (
        <LevelStep selfReportedCefr={selfReportedCefr} setSelfReportedCefr={setSelfReportedCefr} />
      );
    }
    return <PlanStep selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />;
  };

  return (
    <main className="mx-auto max-w-5xl py-3 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-border-soft bg-surface">
        <header className="border-b border-border-soft bg-surface-hover px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3 sm:items-center">
            <Compass className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase text-primary">
                {translate('onboarding.title')}
              </p>
              <h1 className="text-xl font-medium text-foreground sm:text-2xl">
                {translate('onboarding.title')}
              </h1>
            </div>
          </div>
          <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Onboarding progress">
            {STEPS.map((item, itemIndex) => (
              <li
                key={item}
                className="min-w-0"
                aria-current={item === step ? 'step' : undefined}
                aria-label={`Step ${itemIndex + 1}: ${labels[item]}${itemIndex < index ? ', completed' : item === step ? ', current' : ''}`}
              >
                <div
                  className={`h-1.5 rounded-full ${itemIndex <= index ? 'bg-primary' : 'bg-border-soft'}`}
                />
                <span className="mt-2 hidden truncate text-[10px] font-medium text-muted-copy sm:block">
                  {labels[item]}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs font-medium text-muted-copy sm:hidden">
            Step {index + 1} of {STEPS.length}: {labels[step]}
          </p>
        </header>

        <div className="min-h-[410px] p-5 sm:p-7">
          <StepContent />
        </div>

        <OnboardingFooter
          index={index}
          save={save}
          isLiteMode={isLiteMode}
          exploreLiteAtA1={exploreLiteAtA1}
          continueFlow={continueFlow}
        />
      </section>
    </main>
  );
};

export default OnboardingPage;
