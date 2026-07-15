import { Check } from 'lucide-react';
import { CAREER_GOALS, COMMUNICATION_GOALS } from '@/features/profile/profile.preferences';
import type { CommunicationGoal, SkillName } from '@/features/profile/profile.types';

const focusOptions: Array<{ id: SkillName; label: string }> = [
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'listening', label: 'Listening' },
  { id: 'speaking', label: 'Speaking' },
];

type GoalsStepProps = {
  communicationGoals: CommunicationGoal[];
  setCommunicationGoals: (g: CommunicationGoal[]) => void;
  learningFocus: SkillName[];
  setLearningFocus: (f: SkillName[]) => void;
  careerGoal: string;
  setCareerGoal: (g: string) => void;
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

export const GoalsStep = ({
  communicationGoals,
  setCommunicationGoals,
  learningFocus,
  setLearningFocus,
  careerGoal,
  setCareerGoal,
}: GoalsStepProps) => (
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
          onClick={() => toggle(item.id, learningFocus, setLearningFocus)}
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
);
