import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import type { EngineeringDiscipline } from '@/shared/constants/engineering-disciplines';

import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import type {
  SupportedInterfaceLanguage,
  TranslationKey,
} from '@/features/localization/localization.types';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import type { CommunicationGoal, SkillName } from '@/features/profile/profile.types';

import { BranchLockStep } from './steps/BranchLockStep';
import { GoalsStep } from './steps/GoalsStep';
import { LanguageStep } from './steps/LanguageStep';
import { NativeLanguageStep } from './steps/NativeLanguageStep';
import { PlacementStep } from './steps/PlacementStep';
import { PlanStep } from './steps/PlanStep';

const STEPS = ['branch', 'language', 'native', 'placement', 'goal', 'package'] as const;
type Step = (typeof STEPS)[number];

const labels: Record<Step, TranslationKey> = {
  language: 'onboarding.interfaceLanguage',
  native: 'onboarding.nativeLanguage',
  branch: 'onboarding.yourDiscipline',
  placement: 'onboarding.startingPoint',
  goal: 'onboarding.goals',
  package: 'onboarding.plan',
};

const parseStep = (pathname: string): Step => {
  const routeStep = pathname.split('/').at(-1);
  return STEPS.includes(routeStep as Step) ? (routeStep as Step) : 'branch';
};

const OnboardingFooter = ({
  index,
  onContinue,
  canContinue,
}: {
  index: number;
  onContinue: () => void;
  canContinue: boolean;
}) => {
  const { translate } = useLocalizationStore();

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft bg-surface-hover px-4 py-4 sm:px-7">
      {index > 0 ? (
        <Link
          to={`/onboarding/${STEPS[index - 1]}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-card)] px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" />
          {translate('onboarding.back')}
        </Link>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="public-primary-action min-w-0 px-4 sm:px-5 rounded-[var(--radius-card)] font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {index === STEPS.length - 1
          ? (translate('onboarding.finish') ?? 'Finish')
          : (translate('onboarding.continue') ?? 'Continue')}
        <ArrowRight className="h-4 w-4" />
      </button>
    </footer>
  );
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { translate, setLanguage } = useLocalizationStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? 'local-user';
  const initial = useMemo(() => LearningProfileRepository.getProfile(userId), [userId]);
  const step = parseStep(location.pathname);
  const index = STEPS.indexOf(step);

  const [interfaceLanguage, setInterfaceLanguageState] = useState<SupportedInterfaceLanguage>(
    initial.interfaceLanguage as SupportedInterfaceLanguage
  );
  const [nativeLanguage, setNativeLanguageState] = useState<SupportedInterfaceLanguage>(
    (initial.nativeLanguage as SupportedInterfaceLanguage) || interfaceLanguage
  );
  const [discipline, setDiscipline] = useState<EngineeringDiscipline>(initial.discipline);
  const [branchLockConfirmations, setBranchLockConfirmations] = useState(0);
  const [communicationGoals, setCommunicationGoals] = useState<CommunicationGoal[]>(
    initial.communicationGoals
  );
  const [learningFocus, setLearningFocus] = useState<SkillName[]>(initial.learningFocus);
  const [careerGoal, setCareerGoal] = useState(initial.careerGoal);

  type PlanId = 'junior' | 'senior' | 'specialist' | 'master' | 'team';
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(
    ['junior', 'senior', 'specialist', 'master', 'team'].includes(initial.selectedPlan as string)
      ? (initial.selectedPlan as PlanId)
      : 'junior'
  );

  useEffect(() => {
    if (interfaceLanguage !== initial.interfaceLanguage) {
      setLanguage(interfaceLanguage);
    }
  }, [interfaceLanguage, initial.interfaceLanguage, setLanguage]);

  const save = (complete = false) => {
    LearningProfileRepository.updatePreferences(userId, {
      discipline,
      professionalTrack: discipline as never,
      interfaceLanguage: interfaceLanguage as never,
      nativeLanguage: nativeLanguage as never,
      communicationGoals,
      learningFocus,
      careerGoal,
      selectedPlan,
      branchLockConfirmations,
      onboardingCompleted: complete,
    });
  };

  const navigateNext = () => {
    navigate(`/onboarding/${STEPS[index + 1]}`);
  };

  const navigateFinal = () => {
    ProductAnalyticsService.track('onboarding_completed', '/onboarding/package', {
      metadata: { plan: selectedPlan, discipline, source: 'user' },
    });
    navigate('/curriculum', { replace: true });
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

  const canContinue = (() => {
    if (step === 'language') return !!interfaceLanguage && interfaceLanguage !== 'en';
    if (step === 'native') return !!nativeLanguage;
    if (step === 'branch') return !!discipline && branchLockConfirmations >= 2;
    if (step === 'placement') return true;
    if (step === 'goal') return true;
    if (step === 'package') return !!selectedPlan;
    return true;
  })();

  const StepContent = () => {
    if (step === 'language') {
      return <LanguageStep language={interfaceLanguage} setLanguage={setInterfaceLanguageState} />;
    }
    if (step === 'native') {
      return <NativeLanguageStep language={nativeLanguage} setLanguage={setNativeLanguageState} />;
    }
    if (step === 'branch') {
      return (
        <BranchLockStep
          discipline={discipline}
          setDiscipline={setDiscipline}
          branchLockConfirmations={branchLockConfirmations}
          setBranchLockConfirmations={setBranchLockConfirmations}
        />
      );
    }
    if (step === 'placement') {
      return <PlacementStep onComplete={continueFlow} />;
    }
    if (step === 'goal') {
      return (
        <GoalsStep
          communicationGoals={communicationGoals}
          setCommunicationGoals={setCommunicationGoals}
          learningFocus={learningFocus}
          setLearningFocus={setLearningFocus}
          careerGoal={careerGoal}
          setCareerGoal={setCareerGoal}
        />
      );
    }
    return <PlanStep selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />;
  };

  return (
    <main className="mx-auto max-w-5xl py-3 sm:py-6">
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface">
        <header className="border-b border-border-soft bg-surface-hover px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <Link
                to="/welcome"
                className="inline-flex items-center gap-2 text-sm font-medium text-underline text-primary hover:text-primary-foreground"
              >
                {translate('onboarding.welcome')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
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
          <ol className="mt-5 grid grid-cols-6 gap-2" aria-label="Onboarding progress">
            {STEPS.map((item, itemIndex) => (
              <li
                key={item}
                className="min-w-0"
                aria-current={item === step ? 'step' : undefined}
                aria-label={`Step ${itemIndex + 1}: ${translate(labels[item])}${itemIndex < index ? ', completed' : item === step ? ', current' : ''}`}
              >
                <div
                  className={`h-1.5 rounded-full ${itemIndex <= index ? 'bg-primary' : 'bg-border-soft'}`}
                />
                <span className="mt-2 hidden truncate text-[10px] font-medium text-muted-copy sm:block">
                  {translate(labels[item])}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs font-medium text-muted-copy sm:hidden">
            {translate('onboarding.stepOf')
              .replace('{current}', String(index + 1))
              .replace('{total}', String(STEPS.length))}
            : {translate(labels[step])}
          </p>
        </header>

        <div className="min-h-[410px] p-5 sm:p-7">
          <StepContent />
        </div>

        <OnboardingFooter index={index} onContinue={continueFlow} canContinue={canContinue} />
      </section>
    </main>
  );
};

export default OnboardingPage;
