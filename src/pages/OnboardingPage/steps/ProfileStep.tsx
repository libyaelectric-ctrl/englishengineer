import { useLocalizationStore } from '@/features/localization';
import {
  COUNTRIES,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  TIMEZONES,
} from '@/features/profile/profile.preferences';

type ProfileStepProps = {
  minutes: number;
  setMinutes: (n: number) => void;
  taskCount: number;
  setTaskCount: (n: number) => void;
  country: string;
  setCountry: (s: string) => void;
  timezone: string;
  setTimezone: (s: string) => void;
  initialTimezone: string;
};

export const ProfileStep = ({
  minutes,
  setMinutes,
  taskCount,
  setTaskCount,
  country,
  setCountry,
  timezone,
  setTimezone,
  initialTimezone,
}: ProfileStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.dailyRhythm')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.rhythmDesc')}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">
          {translate('onboarding.dailyMinutes')}
          <select
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            {DAILY_DURATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} {translate('onboarding.minutes')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          {translate('onboarding.dailyTasks')}
          <select
            value={taskCount}
            onChange={(event) => setTaskCount(Number(event.target.value))}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            {DAILY_TASK_COUNT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} {translate('onboarding.tasks')}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          {translate('onboarding.country')}
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            className="premium-input mt-2 w-full px-3 py-3 rounded-lg"
          >
            <option value="">{translate('onboarding.selectCountry')}</option>
            {COUNTRIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          {translate('onboarding.timezone')}
          <select
            value={TIMEZONES.includes(timezone as (typeof TIMEZONES)[number]) ? timezone : 'UTC'}
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
            {translate('onboarding.detected').replace('{tz}', initialTimezone)}
          </span>
        </label>
      </div>
    </section>
  );
};
