import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import type {
  CommunicationGoal,
  ElectricalSubdomain,
  IndustryId,
  ProfessionId,
  ProfessionalTrack,
  SelfReportedCefr,
  SkillName,
  UserLearningProfile,
} from '@/features/profile/profile.types';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { PlacementService } from '@/features/placement';
import { ProfileStep } from './steps/ProfileStep';
import { RoleStep } from './steps/RoleStep';
import { GoalsStep } from './steps/GoalsStep';
import { LevelStep } from './steps/LevelStep';
import { PlanStep } from './steps/PlanStep';

const STEPS = ['profile', 'role', 'goals', 'level', 'plan'] as const;
type Step = (typeof STEPS)[number];

const labels: Record<Step, string> = {
  profile: 'Study rhythm',
  role: 'Role and industry',
  goals: 'Communication goals',
  level: 'Starting point',
  plan: 'Plan',
};

const parseStep = (pathname: string): Step => {
  const routeStep = pathname.split('/').at(-1);
  return STEPS.includes(routeStep as Step) ? (routeStep as Step) : 'profile';
};

const buildSavePayload = (overrides: {
  professionalTrack: ProfessionalTrack;
  industryId: IndustryId | '';
  communicationGoals: CommunicationGoal[];
  selfReportedCefr: SelfReportedCefr;
  learningFocus: SkillName[];
  selectedPlan: UserLearningProfile['selectedPlan'];
  electricalSubdomain: ElectricalSubdomain;
  careerGoal: string;
  country: string;
  timezone: string;
  minutes: number;
  taskCount: number;
}) => ({
  professionId: (overrides.professionalTrack === 'electrical'
    ? 'electrical-engineer'
    : null) as ProfessionId | null,
  industryId: overrides.industryId || null,
  communicationGoals: overrides.communicationGoals,
  selfReportedCefr: overrides.selfReportedCefr,
  learningFocus: overrides.learningFocus,
  selectedPlan: overrides.selectedPlan,
  professionalTrack: overrides.professionalTrack,
  electricalSubdomain: overrides.electricalSubdomain,
  careerGoal: overrides.careerGoal,
  country: overrides.country,
  timezone: overrides.timezone,
  dailyTarget: { minutes: overrides.minutes, taskCount: overrides.taskCount },
});

const StepContent = ({
  step,
  minutes,
  setMinutes,
  taskCount,
  setTaskCount,
  country,
  setCountry,
  timezone,
  setTimezone,
  initialTimezone,
  professionalTrack,
  setProfessionalTrack,
  electricalSubdomain,
  setElectricalSubdomain,
  industryId,
  setIndustryId,
  communicationGoals,
  setCommunicationGoals,
  learningFocus,
  setLearningFocus,
  careerGoal,
  setCareerGoal,
  selfReportedCefr,
  setSelfReportedCefr,
  selectedPlan,
  setSelectedPlan,
}: {
  step: Step;
  minutes: number;
  setMinutes: React.Dispatch<React.SetStateAction<number>>;
  taskCount: number;
  setTaskCount: React.Dispatch<React.SetStateAction<number>>;
  country: string;
  setCountry: React.Dispatch<React.SetStateAction<string>>;
  timezone: string;
  setTimezone: React.Dispatch<React.SetStateAction<string>>;
  initialTimezone: string;
  professionalTrack: ProfessionalTrack;
  setProfessionalTrack: React.Dispatch<React.SetStateAction<ProfessionalTrack>>;
  electricalSubdomain: ElectricalSubdomain;
  setElectricalSubdomain: React.Dispatch<
    React.SetStateAction<ElectricalSubdomain>
  >;
  industryId: IndustryId | '';
  setIndustryId: React.Dispatch<React.SetStateAction<IndustryId | ''>>;
  communicationGoals: CommunicationGoal[];
  setCommunicationGoals: React.Dispatch<
    React.SetStateAction<CommunicationGoal[]>
  >;
  learningFocus: SkillName[];
  setLearningFocus: React.Dispatch<React.SetStateAction<SkillName[]>>;
  careerGoal: string;
  setCareerGoal: React.Dispatch<React.SetStateAction<string>>;
  selfReportedCefr: SelfReportedCefr;
  setSelfReportedCefr: React.Dispatch<React.SetStateAction<SelfReportedCefr>>;
  selectedPlan: UserLearningProfile['selectedPlan'];
  setSelectedPlan: React.Dispatch<
    React.SetStateAction<UserLearningProfile['selectedPlan']>
  >;
}) => {
  if (step === 'profile') {
    return (
      <ProfileStep
        minutes={minutes}
        setMinutes={setMinutes}
        taskCount={taskCount}
        setTaskCount={setTaskCount}
        country={country}
        setCountry={setCountry}
        timezone={timezone}
        setTimezone={setTimezone}
        initialTimezone={initialTimezone}
      />
    );
  }
  if (step === 'role') {
    return (
      <RoleStep
        professionalTrack={professionalTrack}
        setProfessionalTrack={setProfessionalTrack}
        electricalSubdomain={electricalSubdomain}
        setElectricalSubdomain={setElectricalSubdomain}
        industryId={industryId}
        setIndustryId={setIndustryId}
      />
    );
  }
  if (step === 'goals') {
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
  if (step === 'level') {
    return (
      <LevelStep
        selfReportedCefr={selfReportedCefr}
        setSelfReportedCefr={setSelfReportedCefr}
      />
    );
  }
  return (
    <PlanStep selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
  );
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
  const currentUser = useAuthStore((state) => state.currentUser);
  const userId = currentUser?.id ?? 'local-user';
  const initial = useMemo(
    () => LearningProfileRepository.getProfile(userId),
    [userId]
  );
  const step = parseStep(location.pathname);
  const index = STEPS.indexOf(step);
  const [minutes, setMinutes] = useState(initial.dailyTarget.minutes);
  const [taskCount, setTaskCount] = useState(initial.dailyTarget.taskCount);
  const [industryId, setIndustryId] = useState<IndustryId | ''>(
    initial.industryId ?? ''
  );
  const [communicationGoals, setCommunicationGoals] = useState<
    CommunicationGoal[]
  >(initial.communicationGoals);
  const [learningFocus, setLearningFocus] = useState<SkillName[]>(
    initial.learningFocus
  );
  const [selfReportedCefr, setSelfReportedCefr] = useState<SelfReportedCefr>(
    initial.selfReportedCefr
  );
  const [selectedPlan, setSelectedPlan] = useState(initial.selectedPlan);
  const [professionalTrack, setProfessionalTrack] = useState<ProfessionalTrack>(
    initial.professionalTrack
  );
  const [electricalSubdomain, setElectricalSubdomain] =
    useState<ElectricalSubdomain>(initial.electricalSubdomain ?? 'low-voltage');
  const [careerGoal, setCareerGoal] = useState(initial.careerGoal);
  const [country, setCountry] = useState(initial.country);
  const [timezone, setTimezone] = useState(initial.timezone);
  const isLiteMode =
    new URLSearchParams(location.search).get('mode') === 'lite';

  const save = (complete = false) => {
    LearningProfileRepository.updatePreferences(userId, {
      ...buildSavePayload({
        professionalTrack,
        industryId,
        communicationGoals,
        selfReportedCefr,
        learningFocus,
        selectedPlan,
        electricalSubdomain,
        careerGoal,
        country,
        timezone,
        minutes,
        taskCount,
      }),
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

  return (
    <main className="mx-auto max-w-5xl py-3 sm:py-6">
      <section className="overflow-hidden rounded-xl border border-border-soft bg-surface">
        <header className="border-b border-border-soft bg-surface-hover px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3 sm:items-center">
            <Compass className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase text-primary">
                Personal setup
              </p>
              <h1 className="text-xl font-medium text-foreground sm:text-2xl">
                Personal setup
              </h1>
            </div>
          </div>
          <ol
            className="mt-5 grid grid-cols-5 gap-2"
            aria-label="Onboarding progress"
          >
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
          <StepContent
            step={step}
            minutes={minutes}
            setMinutes={setMinutes}
            taskCount={taskCount}
            setTaskCount={setTaskCount}
            country={country}
            setCountry={setCountry}
            timezone={timezone}
            setTimezone={setTimezone}
            initialTimezone={initial.timezone}
            professionalTrack={professionalTrack}
            setProfessionalTrack={setProfessionalTrack}
            electricalSubdomain={electricalSubdomain}
            setElectricalSubdomain={setElectricalSubdomain}
            industryId={industryId}
            setIndustryId={setIndustryId}
            communicationGoals={communicationGoals}
            setCommunicationGoals={setCommunicationGoals}
            learningFocus={learningFocus}
            setLearningFocus={setLearningFocus}
            careerGoal={careerGoal}
            setCareerGoal={setCareerGoal}
            selfReportedCefr={selfReportedCefr}
            setSelfReportedCefr={setSelfReportedCefr}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
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
