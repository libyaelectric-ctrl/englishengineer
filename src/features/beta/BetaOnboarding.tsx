import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { BETA_ONBOARDING_OPTIONS } from './beta.helpers';
import { useBetaStore } from './beta.store';
import { BetaOnboardingProfile } from './beta.types';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileRepository,
  type ProfessionId,
} from '@/features/profile';
import { ProductAnalyticsService } from '@/features/analytics/product-analytics.service';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const BetaOnboarding = () => {
  const userId = useAuthStore((state) => state.currentUser?.id);
  const onboardingProfile = useBetaStore((state) => state.onboardingProfile);
  const completeOnboarding = useBetaStore((state) => state.completeOnboarding);
  const [form, setForm] = useState<Omit<BetaOnboardingProfile, 'completedAt'>>({
    engineeringDiscipline: BETA_ONBOARDING_OPTIONS.engineeringDisciplines[0],
    experienceLevel: BETA_ONBOARDING_OPTIONS.experienceLevels[1],
    currentEnglishLevel: BETA_ONBOARDING_OPTIONS.englishLevels[0],
    targetEnglishLevel: BETA_ONBOARDING_OPTIONS.englishLevels[6],
    industry: BETA_ONBOARDING_OPTIONS.industries[0],
    dailyStudyGoal: BETA_ONBOARDING_OPTIONS.dailyGoals[1],
    careerGoal: BETA_ONBOARDING_OPTIONS.careerGoals[0],
    timezone,
    learningPathChoice: 'start_a1',
  });

  useEffect(() => {
    if (!onboardingProfile) {
      ProductAnalyticsService.trackOnce('onboarding_started', '/onboarding', {
        source: 'system',
      });
    }
  }, [onboardingProfile]);

  if (onboardingProfile) {
    return null;
  }

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const finishOnboarding = () => {
    const professionByDiscipline: Record<string, ProfessionId> = {
      'Electrical Engineering': 'electrical-engineer',
      'MEP Engineering': 'mep-engineer',
      Commissioning: 'commissioning-engineer',
      'QA/QC': 'qa-qc-engineer',
      'Project Engineering': 'project-engineer',
      'Construction Management': 'construction-manager',
      'Hospital Engineering': 'mep-engineer',
      'Data Center Engineering': 'electrical-engineer',
    };
    const minutes = Number.parseInt(form.dailyStudyGoal, 10) || 15;
    LearningProfileRepository.updatePreferences(userId ?? 'local-user', {
      goals: ['work', 'engineering'],
      professionId:
        professionByDiscipline[form.engineeringDiscipline] ??
        'electrical-engineer',
      dailyTarget: {
        minutes,
        taskCount: Math.max(1, Math.round(minutes / 10)),
      },
      onboardingCompleted: true,
    });
    completeOnboarding(form);
    window.history.replaceState(null, '', '/dashboard');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const renderSelect = (
    label: string,
    key: keyof typeof form,
    options: string[]
  ) => (
    <label className="space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-copy">
        {label}
      </span>
      <select
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        className="w-full rounded-[12px] border border-border-soft bg-surface px-3 py-2 text-sm font-semibold text-foreground"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/35 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-border-soft bg-surface p-4 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:max-h-[calc(100dvh-2rem)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border border-blue-200 bg-blue-50 p-3 text-blue-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-copy">
              Closed Beta Setup
            </p>
            <h2 className="mt-2 text-3xl font-black text-foreground">
              Calibrate EngVox for your work.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-copy">
              Only essential beta fields are collected locally. You can use the
              product without connecting a production backend.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {renderSelect(
            'Engineering Discipline',
            'engineeringDiscipline',
            BETA_ONBOARDING_OPTIONS.engineeringDisciplines
          )}
          {renderSelect(
            'Experience Level',
            'experienceLevel',
            BETA_ONBOARDING_OPTIONS.experienceLevels
          )}
          {renderSelect(
            'Current English Level',
            'currentEnglishLevel',
            BETA_ONBOARDING_OPTIONS.englishLevels
          )}
          {renderSelect(
            'Target English Level',
            'targetEnglishLevel',
            BETA_ONBOARDING_OPTIONS.englishLevels
          )}
          {renderSelect(
            'Industry',
            'industry',
            BETA_ONBOARDING_OPTIONS.industries
          )}
          {renderSelect(
            'Daily Study Goal',
            'dailyStudyGoal',
            BETA_ONBOARDING_OPTIONS.dailyGoals
          )}
          {renderSelect(
            'Career Goal',
            'careerGoal',
            BETA_ONBOARDING_OPTIONS.careerGoals
          )}
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-copy">
              Timezone
            </span>
            <input
              value={form.timezone}
              onChange={(event) => updateField('timezone', event.target.value)}
              className="w-full rounded-[12px] border border-border-soft bg-surface px-3 py-2 text-sm font-semibold text-foreground"
            />
          </label>
        </div>

        <div className="mt-5 rounded-[12px] border border-border-soft bg-surface-hover p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-copy">
            Choose your starting path
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(
              [
                ['start_a1', 'Start from A1'],
                ['placement_check', 'Placement check'],
                ['explore_demo', 'Explore demo content'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    learningPathChoice: value,
                  }))
                }
                className={`rounded-[10px] border px-3 py-3 text-sm font-semibold transition ${form.learningPathChoice === value ? 'border-sky-300 bg-primary/5 text-sky-900' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-primary/5/50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-copy">
            {form.learningPathChoice === 'placement_check'
              ? 'Placement check is coming soon. Your level remains A1 until task evidence creates an estimate.'
              : form.learningPathChoice === 'explore_demo'
                ? 'Demo content may show advanced previews, but your learning path still starts at A1.'
                : 'Your sequential learning path starts at A1.'}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-copy">
          Your level starts at A1 in demo mode. EngVox updates the estimate
          after enough completed tasks. Scores are internal Engineering
          Communication estimates, not official CEFR certificates.
        </p>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={finishOnboarding}
            className="bg-sky-600 text-white hover:bg-sky-700"
          >
            Enter Closed Beta
          </Button>
        </div>
      </div>
    </div>
  );
};
