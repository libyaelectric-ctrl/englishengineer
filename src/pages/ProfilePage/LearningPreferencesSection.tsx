import { FormEvent } from 'react';
import { Save, Target, ChevronDown } from 'lucide-react';
import { SectionCard } from '@/shared/components/SectionCard';
import { Button } from '@/shared/components/Button';
import {
  LEARNING_GOALS,
  DAILY_DURATION_OPTIONS,
  DAILY_TASK_COUNT_OPTIONS,
  EXPERIENCE_LEVELS,
} from '@/features/profile/profile.preferences';

interface LearningPreferencesSectionProps {
  prefGoals: string[];
  setPrefGoals: React.Dispatch<React.SetStateAction<string[]>>;
  prefMinutes: number;
  setPrefMinutes: (val: number) => void;
  prefTasks: number;
  setPrefTasks: (val: number) => void;
  prefMissedDays: number;
  setPrefMissedDays: (val: number) => void;
  prefExpLevel: string;
  setPrefExpLevel: (val: string) => void;
  prefCareerGoal: string;
  setPrefCareerGoal: (val: string) => void;
  preferencesSaved: boolean;
  onSave: (e: FormEvent) => void;
}

export const LearningPreferencesSection = ({
  prefGoals,
  setPrefGoals,
  prefMinutes,
  setPrefMinutes,
  prefTasks,
  setPrefTasks,
  prefMissedDays,
  setPrefMissedDays,
  prefExpLevel,
  setPrefExpLevel,
  prefCareerGoal,
  setPrefCareerGoal,
  preferencesSaved,
  onSave,
}: LearningPreferencesSectionProps) => (
  <section
    id="preferences"
    className="animate-in fade-in duration-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
  >
    <SectionCard
      title="Learning Preferences"
      subtitle="Manage your learning goals, target pace, and training rhythm"
      icon={Target}
    >
      <form onSubmit={onSave} className="space-y-6">
        <fieldset>
          <legend className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Learning Goals
          </legend>
          <p className="mt-0.5 text-[10px] text-muted-copy font-medium">
            Select one or more goals.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {LEARNING_GOALS.map((goal) => {
              const isChecked = prefGoals.includes(goal.id);
              return (
                <label
                  key={goal.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-[4px] border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    isChecked
                      ? 'border-[#0047bb]/40 bg-[#0047bb]/10 text-foreground'
                      : 'border-[#d9d9e3] bg-white text-muted-copy hover:border-[#0047bb]/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setPrefGoals((curr) =>
                        curr.includes(goal.id)
                          ? curr.filter((id) => id !== goal.id)
                          : [...curr, goal.id]
                      );
                    }}
                    className="h-3.5 w-3.5 accent-[#0047bb] rounded-[4px] border border-[#d9d9e3] shadow-sm cursor-pointer"
                  />
                  {goal.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
            Daily Study Target (Minutes)
            <select
              value={prefMinutes}
              onChange={(event) => setPrefMinutes(Number(event.target.value))}
              className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors cursor-pointer shadow-sm"
            >
              {DAILY_DURATION_OPTIONS.map((val) => (
                <option key={val} value={val}>
                  {val} minutes
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
            Daily Task Limit
            <select
              value={prefTasks}
              onChange={(event) => setPrefTasks(Number(event.target.value))}
              className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors cursor-pointer shadow-sm"
            >
              {DAILY_TASK_COUNT_OPTIONS.map((val) => (
                <option key={val} value={val}>
                  {val} tasks
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Advanced Preferences */}
        <details className="group border border-[#d9d9e3] rounded-[4px] bg-white p-4 shadow-sm animate-in fade-in duration-300">
          <summary className="flex cursor-pointer items-center justify-between font-bold text-xs uppercase tracking-wider text-foreground list-none select-none">
            <span>Advanced learning preferences</span>
            <ChevronDown className="h-4 w-4 text-muted-copy transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-4 space-y-4 pt-3 border-t border-[#d9d9e3]">
            <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
              Weekly Streak Tolerance (Allowed Missed Days)
              <select
                value={prefMissedDays}
                onChange={(event) =>
                  setPrefMissedDays(Number(event.target.value))
                }
                className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors cursor-pointer shadow-sm"
              >
                {[0, 1, 2, 3].map((val) => (
                  <option key={val} value={val}>
                    {val} missed {val === 1 ? 'day' : 'days'}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
              Experience Level
              <select
                value={prefExpLevel}
                onChange={(event) => setPrefExpLevel(event.target.value)}
                className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors cursor-pointer shadow-sm"
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1.5">
              <label
                htmlFor="pref-career-goal"
                className="text-[10px] font-bold uppercase tracking-wider text-foreground"
              >
                Target Career Goal
              </label>
              <input
                id="pref-career-goal"
                value={prefCareerGoal}
                onChange={(event) => setPrefCareerGoal(event.target.value)}
                placeholder="e.g. Lead site meetings with confidence"
                className="w-full rounded-[4px] border border-[#d9d9e3] bg-white px-3 py-2 text-xs text-foreground outline-none focus:border-[#0047bb] focus:ring-1 focus:ring-[#0047bb]/15 transition-colors font-bold shadow-sm"
              />
            </div>
          </div>
        </details>

        <div className="flex items-center justify-end gap-3 border-t border-[#d9d9e3] pt-4">
          {preferencesSaved && (
            <span className="text-xs font-bold text-success uppercase tracking-wider animate-pulse">
              Saved
            </span>
          )}
          <Button
            type="submit"
            className="text-xs min-h-9 bg-[#0047bb] hover:bg-[#0047bb]/90 border border-[#0047bb] text-white font-bold uppercase tracking-wider rounded-[4px] cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5 mr-1" /> Save Preferences
          </Button>
        </div>
      </form>
    </SectionCard>
  </section>
);
