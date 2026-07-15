import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import type {
  CommunicationGoal,
  ElectricalSubdomain,
  IndustryId,
  InterfaceLanguage,
  ProfessionalTrack,
  SelfReportedCefr,
  SkillName,
} from '@/features/profile/profile.types';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';
import { PlacementService } from '@/features/placement';
import {
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';
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

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const setGlobalLanguage = useLocalizationStore((state) => state.setLanguage);
  const userId = currentUser?.id ?? 'local-user';
  const initial = useMemo(
    () => LearningProfileRepository.getProfile(userId),
    [userId]
  );
  const routeStep = location.pathname.split('/').at(-1);
  const step: Step = STEPS.includes(routeStep as Step)
    ? (routeStep as Step)
    : 'profile';
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
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(
    initial.interfaceLanguage
  );
  const isLiteMode =
    new URLSearchParams(location.search).get('mode') === 'lite';

  const save = (complete = false) => {
    LearningProfileRepository.updatePreferences(userId, {
      professionId:
        professionalTrack === 'electrical' ? 'electrical-engineer' : null,
      industryId: industryId || null,
      communicationGoals,
      selfReportedCefr,
      learningFocus,
      selectedPlan,
      professionalTrack,
      electricalSubdomain,
      careerGoal,
      country,
      timezone,
      interfaceLanguage,
      dailyTarget: { minutes, taskCount },
      onboardingCompleted: complete,
    });
  };

  const continueFlow = () => {
    const complete = index === STEPS.length - 1;
    save(complete);
    if (complete) {
      ProductAnalyticsService.track(
        'onboarding_completed',
        '/onboarding/plan',
        {
          metadata: { plan: selectedPlan, source: 'user' },
        }
      );
      navigate(initial.placementCompleted ? '/curriculum' : '/placement', {
        replace: true,
      });
      return;
    }
    navigate(`/onboarding/${STEPS[index + 1]}`);
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
                {LocalizationService.translate(
                  'onboarding.title',
                  interfaceLanguage
                )}
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
          {step === 'profile' && (
            <ProfileStep
              minutes={minutes}
              setMinutes={setMinutes}
              taskCount={taskCount}
              setTaskCount={setTaskCount}
              country={country}
              setCountry={setCountry}
              timezone={timezone}
              setTimezone={setTimezone}
              interfaceLanguage={interfaceLanguage}
              setInterfaceLanguage={setInterfaceLanguage}
              initialTimezone={initial.timezone}
              setGlobalLanguage={setGlobalLanguage}
            />
          )}
          {step === 'role' && (
            <RoleStep
              professionalTrack={professionalTrack}
              setProfessionalTrack={setProfessionalTrack}
              electricalSubdomain={electricalSubdomain}
              setElectricalSubdomain={setElectricalSubdomain}
              industryId={industryId}
              setIndustryId={setIndustryId}
              interfaceLanguage={interfaceLanguage}
            />
          )}
          {step === 'goals' && (
            <GoalsStep
              communicationGoals={communicationGoals}
              setCommunicationGoals={setCommunicationGoals}
              learningFocus={learningFocus}
              setLearningFocus={setLearningFocus}
              careerGoal={careerGoal}
              setCareerGoal={setCareerGoal}
            />
          )}
          {step === 'level' && (
            <LevelStep
              selfReportedCefr={selfReportedCefr}
              setSelfReportedCefr={setSelfReportedCefr}
            />
          )}
          {step === 'plan' && (
            <PlanStep
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
            />
          )}
        </div>

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
              {index === STEPS.length - 1
                ? 'Continue to placement'
                : 'Continue'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default OnboardingPage;
