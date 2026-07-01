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
        <legend className="text-sm font-black text-slate-900">
          Learning goals
        </legend>
        <p className="mt-1 text-xs text-slate-500">Select one or more.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {LEARNING_GOALS.map((goal) => (
            <label
              key={goal.id}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${
                goals.includes(goal.id)
                  ? 'border-sky-400 bg-sky-50 text-sky-800'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={goals.includes(goal.id)}
                onChange={() => toggleGoal(goal.id)}
                className="h-4 w-4 accent-sky-600"
              />
              {goal.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-2 text-sm font-bold text-slate-800">
        Profession / role
        <select
          value={professionId}
          onChange={(event) => {
            setSaved(false);
            setProfessionId(event.target.value as ProfessionId | '');
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-sky-400"
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
        <label className="space-y-2 text-sm font-bold text-slate-800">
          Daily minutes
          <select
            value={minutes}
            onChange={(event) => setMinutes(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            {DAILY_DURATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} minutes
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-800">
          Daily tasks
          <select
            value={taskCount}
            onChange={(event) => setTaskCount(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            {DAILY_TASK_COUNT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} tasks
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-bold text-slate-800">
          Weekly tolerance
          <select
            value={allowedMissedDays}
            onChange={(event) =>
              setAllowedMissedDays(Number(event.target.value))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
          >
            {[0, 1, 2].map((value) => (
              <option key={value} value={value}>
                {value} missed {value === 1 ? 'day' : 'days'}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
        {saved && (
          <span className="text-sm font-bold text-emerald-700">Saved</span>
        )}
        <Button type="submit">
          <Save className="h-4 w-4" /> {submitLabel}
        </Button>
      </div>
    </form>
  );
};
