import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Compass } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import {
  COMMUNICATION_GOALS,
  CAREER_GOALS,
  COUNTRIES,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  ELECTRICAL_SUBDOMAINS,
  INDUSTRIES,
  PROFESSIONAL_TRACKS,
  TIMEZONES,
} from '@/features/profile/profile.preferences';
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
  AVAILABLE_INTERFACE_LANGUAGES,
  LocalizationService,
  useLocalizationStore,
} from '@/features/localization';

const STEPS = ['profile', 'role', 'goals', 'level', 'plan'] as const;
type Step = (typeof STEPS)[number];

const labels: Record<Step, string> = {
  profile: 'Study rhythm',
  role: 'Role and industry',
  goals: 'Communication goals',
  level: 'Starting point',
  plan: 'Plan',
};

const focusOptions: Array<{ id: SkillName; label: string }> = [
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'speaking', label: 'Speaking' },
];

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

  const toggle = <T extends string>(
    value: T,
    values: T[],
    setValues: (next: T[]) => void
  ) =>
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );

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
            <section>
              <h2 className="text-xl font-medium">
                Set a realistic daily rhythm
              </h2>
              <p className="mt-2 text-sm text-muted-copy">
                You can change this later. Each skill still progresses
                independently.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-foreground">
                  Daily minutes
                  <select
                    value={minutes}
                    onChange={(event) => setMinutes(Number(event.target.value))}
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {DAILY_DURATION_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value} minutes
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-foreground">
                  Daily tasks
                  <select
                    value={taskCount}
                    onChange={(event) =>
                      setTaskCount(Number(event.target.value))
                    }
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {DAILY_TASK_COUNT_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value} tasks
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-foreground">
                  Country
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-foreground">
                  Timezone
                  <select
                    value={
                      TIMEZONES.includes(timezone as (typeof TIMEZONES)[number])
                        ? timezone
                        : 'UTC'
                    }
                    onChange={(event) => setTimezone(event.target.value)}
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {TIMEZONES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-muted-copy">
                    Detected: {initial.timezone}. You can correct it here.
                  </span>
                </label>
                <label className="text-sm font-medium text-foreground sm:col-span-2">
                  Interface language
                  <select
                    value={interfaceLanguage}
                    onChange={(event) => {
                      const language = event.target.value as InterfaceLanguage;
                      setInterfaceLanguage(language);
                      setGlobalLanguage(language);
                    }}
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {AVAILABLE_INTERFACE_LANGUAGES.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-muted-copy">
                    Arabic, Spanish, French and Portuguese are prepared for
                    future language packs.
                  </span>
                </label>
              </div>
            </section>
          )}

          {step === 'role' && (
            <section>
              <h2 className="text-xl font-medium">Tell us where you work</h2>
              <p className="mt-2 text-sm text-muted-copy">
                {LocalizationService.translate(
                  'onboarding.roleContext',
                  interfaceLanguage
                )}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium sm:col-span-2">
                  {LocalizationService.translate(
                    'onboarding.professionalTrack',
                    interfaceLanguage
                  )}
                  <select
                    value={professionalTrack}
                    onChange={(event) =>
                      setProfessionalTrack(
                        event.target.value as ProfessionalTrack
                      )
                    }
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {PROFESSIONAL_TRACKS.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={!item.available}
                      >
                        {item.label}
                        {item.available ? '' : ' · Coming Soon'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  {LocalizationService.translate(
                    'onboarding.electricalFocus',
                    interfaceLanguage
                  )}
                  <select
                    value={electricalSubdomain}
                    onChange={(event) =>
                      setElectricalSubdomain(
                        event.target.value as ElectricalSubdomain
                      )
                    }
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    {ELECTRICAL_SUBDOMAINS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  {LocalizationService.translate(
                    'onboarding.industry',
                    interfaceLanguage
                  )}
                  <select
                    value={industryId}
                    onChange={(event) =>
                      setIndustryId(event.target.value as IndustryId)
                    }
                    className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>
          )}

          {step === 'goals' && (
            <section>
              <h2 className="text-xl font-medium">Choose communication goals</h2>
              <p className="mt-2 text-sm text-muted-copy">
                Select the situations and skills that matter most now.
              </p>
              <h3 className="mt-6 text-sm font-medium">Work situations</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {COMMUNICATION_GOALS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      toggle(item.id, communicationGoals, setCommunicationGoals)
                    }
                    className={`flex min-h-11 items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${communicationGoals.includes(item.id) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-surface-hover'}`}
                  >
                    {item.label}
                    {communicationGoals.includes(item.id) && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
              <h3 className="mt-6 text-sm font-medium">Learning focus</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {focusOptions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      toggle(item.id, learningFocus, setLearningFocus)
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${learningFocus.includes(item.id) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-surface-hover'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="mt-6 block text-sm font-medium text-foreground">
                Career outcome
                <select
                  value={careerGoal}
                  onChange={(event) => setCareerGoal(event.target.value)}
                  className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
                >
                  <option value="">Select an outcome</option>
                  {CAREER_GOALS.map((goal) => (
                    <option key={goal} value={goal}>
                      {goal}
                    </option>
                  ))}
                </select>
              </label>
            </section>
          )}

          {step === 'level' && (
            <section>
              <h2 className="text-xl font-medium">
                What is your current English level?
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-copy">
                This is a self-reported starting reference, not a certificate or
                placement result. Reading, Writing, Listening and Speaking still
                begin and progress independently.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(
                  [
                    'A1',
                    'A2',
                    'B1',
                    'B2',
                    'C1',
                    'unknown',
                  ] as SelfReportedCefr[]
                ).map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSelfReportedCefr(level)}
                    className={`min-h-14 rounded-lg border text-sm font-medium transition-colors ${selfReportedCefr === level ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-surface-hover'}`}
                  >
                    {level === 'unknown' ? 'I am not sure' : level}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 'plan' && (
            <section>
              <h2 className="text-xl font-medium">
                Choose your starting workspace
              </h2>
              <p className="mt-2 text-sm text-muted-copy">
                Plan selection does not activate billing. Local mode remains
                Free until the backend verifies a subscription.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      id: 'free',
                      label: 'Free',
                      text: 'Start locally with core learning.',
                    },
                    {
                      id: 'pro',
                      label: 'Pro',
                      text: 'Personal advanced features when backend services are active.',
                    },
                    {
                      id: 'enterprise',
                      label: 'Team',
                      text: 'Manager and team workflows for organizations.',
                    },
                  ] as const
                ).map((plan) => (
                  <button
                    type="button"
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-xl border p-5 text-left transition-colors ${selectedPlan === plan.id ? 'border-primary/30 bg-primary/10' : 'border-border-soft bg-surface hover:border-primary/20 hover:bg-surface-hover'}`}
                  >
                    <span className="font-medium text-foreground">
                      {plan.label}
                    </span>
                    <span className="mt-2 block text-xs leading-5 text-muted-copy">
                      {plan.text}
                    </span>
                  </button>
                ))}
              </div>
            </section>
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
