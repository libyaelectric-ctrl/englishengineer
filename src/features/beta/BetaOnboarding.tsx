import { CheckCircle2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Button } from '@/shared/components/Button';
import {
  ENGINEERING_DISCIPLINES,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';
import { LearningProfileRepository } from '@/shared/services/learning-profile.repository';
import { ProductAnalyticsService } from '@/shared/services/product-analytics.service';
import type { ProfessionId } from '@/shared/types/domain.types';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization/localization.types';

import { BETA_ONBOARDING_OPTIONS } from './beta.helpers';
import { useBetaStore } from './beta.store';
import { BetaOnboardingProfile } from './beta.types';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

const getDisciplineLabel = (
  id: EngineeringDiscipline,
  translate: (key: TranslationKey) => string
): string => {
  const labelKey = `discipline.${id}` as TranslationKey;
  const translated = translate(labelKey);
  return translated !== labelKey ? translated : id;
};

export const BetaOnboarding = () => {
  const userId = useAuthStore((state) => state.currentUser?.id);
  const onboardingProfile = useBetaStore((state) => state.onboardingProfile);
  const completeOnboarding = useBetaStore((state) => state.completeOnboarding);
  const { translate } = useLocalizationStore();
  const getInitialDiscipline = () => {
    const saved = localStorage.getItem('preselected_discipline');
    if (saved && ENGINEERING_DISCIPLINES.includes(saved as EngineeringDiscipline)) {
      return saved as EngineeringDiscipline;
    }
    return ENGINEERING_DISCIPLINES[0];
  };

  const [form, setForm] = useState<Omit<BetaOnboardingProfile, 'completedAt'>>({
    engineeringDiscipline: getInitialDiscipline(),
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
    const professionByDiscipline: Record<EngineeringDiscipline, ProfessionId> = {
      architecture: 'architect',
      chemical: 'other',
      civil: 'civil-engineer',
      software: 'project-engineer',
      electrical: 'electrical-engineer',
      electronics: 'electrical-engineer',
      hse: 'qa-qc-engineer',
      industrial: 'project-engineer',
      mechanical: 'mechanical-engineer',
      mechatronics: 'mechanical-engineer',
    };
    const discipline = form.engineeringDiscipline as EngineeringDiscipline;
    const minutes = Number.parseInt(form.dailyStudyGoal, 10) || 15;
    LearningProfileRepository.updatePreferences(userId ?? 'local-user', {
      discipline,
      goals: ['work', 'engineering'],
      professionId: professionByDiscipline[discipline] ?? 'electrical-engineer',
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

  const disciplineLabels = ENGINEERING_DISCIPLINES.reduce(
    (acc, id) => {
      acc[id] = getDisciplineLabel(id, translate);
      return acc;
    },
    {} as Record<EngineeringDiscipline, string>
  );

  const renderSelect = (
    label: string,
    key: keyof typeof form,
    options: string[],
    labelMap?: Record<string, string>
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
            {labelMap?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/35 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto rounded-[20px] border border-border-soft bg-surface p-4 shadow-[var(--shadow-dialog)] sm:max-h-[calc(100dvh-2rem)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-[14px] border border-blue-200 bg-blue-50 p-3 text-blue-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-copy">
              {translate('beta.title')}
            </p>
            <h2 className="mt-2 text-3xl font-black text-foreground">
              {translate('beta.subtitle')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-copy">{translate('beta.dataNotice')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {renderSelect(
            translate('beta.discipline'),
            'engineeringDiscipline',
            BETA_ONBOARDING_OPTIONS.engineeringDisciplines,
            disciplineLabels
          )}
          {renderSelect(
            translate('beta.experienceLevel'),
            'experienceLevel',
            BETA_ONBOARDING_OPTIONS.experienceLevels
          )}
          {renderSelect(
            translate('beta.currentLevel'),
            'currentEnglishLevel',
            BETA_ONBOARDING_OPTIONS.englishLevels
          )}
          {renderSelect(
            translate('beta.targetLevel'),
            'targetEnglishLevel',
            BETA_ONBOARDING_OPTIONS.englishLevels
          )}
          {renderSelect(translate('beta.industry'), 'industry', BETA_ONBOARDING_OPTIONS.industries)}
          {renderSelect(
            translate('beta.dailyGoal'),
            'dailyStudyGoal',
            BETA_ONBOARDING_OPTIONS.dailyGoals
          )}
          {renderSelect(
            translate('beta.careerGoal'),
            'careerGoal',
            BETA_ONBOARDING_OPTIONS.careerGoals
          )}
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-copy">
              {translate('beta.timezone')}
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
            {translate('beta.startPath')}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(
              [
                ['start_a1', 'beta.pathA1'],
                ['placement_check', 'beta.pathPlacement'],
                ['explore_demo', 'beta.pathDemo'],
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
                {translate(label)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-copy">
            {form.learningPathChoice === 'placement_check'
              ? translate('beta.placementSoon')
              : form.learningPathChoice === 'explore_demo'
                ? translate('beta.demoPreview')
                : translate('beta.a1Path')}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-muted-copy">{translate('beta.demoNotice')}</p>

        <div className="mt-6 flex justify-end">
          <Button onClick={finishOnboarding} className="bg-sky-600 text-white hover:bg-sky-700">
            {translate('beta.enterBeta')}
          </Button>
        </div>
      </div>
    </div>
  );
};
