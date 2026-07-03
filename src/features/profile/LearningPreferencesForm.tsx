import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import {
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  LEARNING_GOALS,
  PROFESSIONS,
} from './profile.preferences';
import { LearningProfileRepository } from './profile.repository';
import type { LearningGoal, ProfessionId } from './profile.types';

interface LearningPreferencesFormProps {
  userId: string;
  onSaved?: () => void;
  submitLabel?: string;
}

export const LearningPreferencesForm = ({
  userId,
  onSaved,
  submitLabel = 'Save Learning Preferences',
}: LearningPreferencesFormProps) => {
  const initial = LearningProfileRepository.getProfile(userId);
  const [goals, setGoals] = useState<LearningGoal[]>(initial.goals);
  const [professionId, setProfessionId] = useState<ProfessionId | ''>(
    initial.professionId ?? ''
  );
  const [minutes, setMinutes] = useState(initial.dailyTarget.minutes);
  const [taskCount, setTaskCount] = useState(initial.dailyTarget.taskCount);
  const [allowedMissedDays, setAllowedMissedDays] = useState(
    initial.weeklyTolerance.allowedMissedDays
  );
  const [saved, setSaved] = useState(false);

  const toggleGoal = (goal: LearningGoal) => {
    setSaved(false);
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal]
    );
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        LearningProfileRepository.updatePreferences(userId, {
          goals,
          professionId: professionId || null,
          dailyTarget: { minutes, taskCount },
          weeklyTolerance: { allowedMissedDays },
        });
        setSaved(true);
        onSaved?.();
      }}
    >
      <fieldset>
        <legend className="text-xs font-bold text-foreground">
          Learning goals
        </legend>
        <p className="mt-0.5 text-[10px] text-muted-copy">Select one or more.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {LEARNING_GOALS.map((goal) => (
            <label
              key={goal.id}
              className={`flex cursor-pointer items-center gap-2 rounded-card border px-3 py-2 text-xs font-semibold transition-all ${
                goals.includes(goal.id)
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-border-soft bg-surface text-muted-copy hover:border-border-hover'
              }`}
            >
              <input
                type="checkbox"
                checked={goals.includes(goal.id)}
                onChange={() => toggleGoal(goal.id)}
                className="h-3.5 w-3.5 accent-primary"
              />
              {goal.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1.5 text-xs font-bold text-foreground">
        Profession / role
        <select
          value={professionId}
          onChange={(event) => {
            setSaved(false);
            setProfessionId(event.target.value as ProfessionId | '');
          }}
          className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
        >
          <option value="">Select a role</option>
          {PROFESSIONS.map((profession) => (
            <option key={profession.id} value={profession.id}>
              {profession.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5 text-xs font-bold text-foreground">
          Daily minutes
          <select
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
            className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
          >
            {DAILY_DURATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-bold text-foreground">
          Daily tasks
          <select
            value={taskCount}
            onChange={(event) => setTaskCount(Number(event.target.value))}
            className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
          >
            {DAILY_TASK_COUNT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} tasks
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-bold text-foreground">
          Weekly tolerance
          <select
            value={allowedMissedDays}
            onChange={(event) =>
              setAllowedMissedDays(Number(event.target.value))
            }
            className="w-full rounded-input border border-border-soft bg-surface px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-border-hover"
          >
            {[0, 1, 2].map((value) => (
              <option key={value} value={value}>
                {value} missed {value === 1 ? 'day' : 'days'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
        {saved && (
          <span className="text-xs font-bold text-success">Saved</span>
        )}
        <Button type="submit" className="text-xs min-h-9">
          <Save className="h-3.5 w-3.5" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
};
