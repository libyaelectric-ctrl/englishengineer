import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenCheck,
  Check,
  ClipboardList,
  FileChartColumn,
  Plus,
  Trash2,
} from 'lucide-react';
import { useLearningStore } from '@/core/learning';
import { AssessmentService } from '@/features/assessment';
import { BetaService } from '@/features/beta';
import { useAuthStore } from '@/features/auth';
import { buildLevelProfile, getConfidenceLabel } from '@/features/level-system';
import {
  CAREER_ROLES,
  MISTAKE_CATEGORIES,
  MISTAKE_SUGGESTIONS,
  MistakeCategory,
  buildSevenDayReport,
  getPersonalizedTasks,
  isTaskCompletedToday,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';

const LearningIntelligencePage = () => {
  const navigate = useNavigate();
  const learning = useLearningStore();
  const intelligence = useLearningIntelligenceStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [category, setCategory] = useState<MistakeCategory>('grammar');
  const [originalText, setOriginalText] = useState('');
  const [correction, setCorrection] = useState('');
  const assessment = AssessmentService.getProfile(learning);
  const levelProfile = buildLevelProfile(learning, currentUser?.id);
  const weakArea = assessment.weakestDimensions[0]?.label ?? 'Writing';
  const tasks = useMemo(
    () =>
      getPersonalizedTasks(
        intelligence.careerRole,
        levelProfile.overallLevel,
        weakArea,
        intelligence.mistakeLog,
        intelligence.completedTaskDates
      ),
    [
      intelligence.careerRole,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      levelProfile.overallLevel,
      weakArea,
    ]
  );
  const report = useMemo(
    () =>
      buildSevenDayReport(
        learning,
        assessment,
        intelligence.completedTaskDates,
        intelligence.mistakeLog,
        intelligence.careerRole,
        levelProfile.overallLevel
      ),
    [
      assessment,
      intelligence.completedTaskDates,
      intelligence.mistakeLog,
      intelligence.careerRole,
      levelProfile.overallLevel,
      learning,
    ]
  );

  const addMistake = (event: FormEvent) => {
    event.preventDefault();
    if (!originalText.trim() || !correction.trim()) return;
    intelligence.addMistake(category, originalText.trim(), correction.trim());
    setOriginalText('');
    setCorrection('');
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <PageHeader
        title="Learning Intelligence"
        description="Role-based daily practice, repeated-mistake tracking and evidence-based weekly guidance."
        badgeText={`${levelProfile.overallLevel} · ${getConfidenceLabel(levelProfile.confidence)}`}
        badgeColor={assessment.hasEnoughData ? 'success' : 'warning'}
      />

      <Card hoverEffect={false}>
        <label
          className="block text-sm font-medium text-foreground"
          htmlFor="career-role"
        >
          Career goal
        </label>
        <p className="mt-1 text-sm text-muted-copy">
          Your role changes task order, not scoring or learning history.
        </p>
        <select
          id="career-role"
          value={intelligence.careerRole}
          onChange={(event) =>
            intelligence.setCareerRole(
              event.target.value as typeof intelligence.careerRole
            )
          }
          className="mt-4 min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:max-w-md"
        >
          {CAREER_ROLES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-medium text-foreground">
            Today's Engineering Communication Tasks
          </h2>
          <p className="mt-1 text-sm text-muted-copy">
            A balanced six-skill plan ordered for {intelligence.careerRole}.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task, index) => {
            const completed = isTaskCompletedToday(
              task.id,
              intelligence.completedTaskDates
            );
            return (
              <Card key={task.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-primary">
                      Priority {index + 1} · {task.module}
                    </p>
                    <h3 className="mt-1 text-lg font-medium text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      intelligence.toggleTask(task.id);
                      if (!completed) {
                        BetaService.trackEvent(
                          'daily_task_completed',
                          '/learning-plan'
                        );
                      }
                    }}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${completed ? 'border-success bg-success/10 text-success' : 'border-border-soft bg-surface text-muted-copy hover:border-primary hover:bg-primary/10'}`}
                    aria-label={
                      completed ? 'Mark task incomplete' : 'Mark task complete'
                    }
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
                <p className="flex-1 text-sm leading-6 text-muted-copy">
                  {task.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-copy">
                    {task.estimatedMinutes} min
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(task.route)}
                  >
                    Open task
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card id="mistake-log" className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Mistake Log / Hata Defteri
              </h2>
              <p className="text-sm text-muted-copy">
                Record patterns worth practising again.
              </p>
            </div>
          </div>
          <form onSubmit={addMistake} className="space-y-3">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MistakeCategory)
              }
              className="min-h-11 w-full rounded-lg border border-border-soft bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {MISTAKE_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">
              Suggestion: {MISTAKE_SUGGESTIONS[category]}
            </p>
            <textarea
              value={originalText}
              onChange={(event) => setOriginalText(event.target.value)}
              placeholder="Original sentence or repeated mistake"
              className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
              placeholder="Correction and why it is better"
              className="min-h-24 w-full rounded-lg border border-border-soft bg-surface-hover p-3 text-sm outline-none focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="submit"
              disabled={!originalText.trim() || !correction.trim()}
            >
              <Plus className="h-4 w-4" /> Add mistake
            </Button>
          </form>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {intelligence.mistakeLog.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border-hover bg-surface-hover p-6 text-center text-sm text-muted-copy">
                No mistakes saved yet. Add only patterns you want to revisit.
              </p>
            ) : (
              intelligence.mistakeLog.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-border-soft bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-error">
                        {entry.category}
                      </p>
                      <p className="mt-2 text-sm text-muted-copy line-through">
                        {entry.originalText}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {entry.correction}
                      </p>
                    </div>
                    <button
                      onClick={() => intelligence.removeMistake(entry.id)}
                      className="rounded-lg p-2 text-muted-copy hover:bg-error/10 hover:text-error"
                      aria-label="Delete mistake"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-5" hoverEffect={false}>
          <div className="flex items-center gap-3">
            <FileChartColumn className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-medium text-foreground">
                7-Day Progress Report
              </h2>
              <p className="text-sm text-muted-copy">
                Built from existing learning and assessment evidence.
              </p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Completed tasks', String(report.completedTasks)],
              ['Improved skill', report.improvedSkill],
              ['Weak area', report.weakArea],
              ['Internal progress index', String(report.eloEstimate)],
              ['Engineering CEFR', report.cefrEstimate],
              ['Current learning path', report.currentLevel],
              ['Next week focus', report.nextWeekFocus],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-border-soft bg-surface-hover p-4"
              >
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-copy">
                  {label}
                </dt>
                <dd className="mt-2 text-sm font-medium text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-sm font-medium text-foreground">
              Repeated mistakes
            </p>
            <p className="mt-1 text-sm text-muted-copy">
              {report.repeatedMistakes.length
                ? report.repeatedMistakes.join(', ')
                : 'No repeated pattern identified yet.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">Work Tools</p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedWorkTools}
              </p>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">Quick AI</p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedQuickAIAction}
              </p>
            </div>
            <div className="rounded-lg border border-border-soft bg-surface-hover p-3">
              <p className="text-xs font-medium text-muted-copy">
                Phrase category
              </p>
              <p className="mt-1 text-sm text-foreground">
                {report.recommendedPhraseCategory}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Recommended next tasks
            </p>
            <ul className="mt-2 space-y-2">
              {report.recommendedNextTasks.map((task) => (
                <li
                  key={task}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <BookOpenCheck className="h-4 w-4 text-success" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              intelligence.markReportGenerated();
              BetaService.trackEvent(
                'seven_day_report_generated',
                '/learning-plan'
              );
            }}
          >
            Mark report reviewed
          </Button>
        </Card>
      </div>

      <Card className="space-y-4" hoverEffect={false}>
        <h2 className="text-xl font-medium text-foreground">
          Assessment explanation
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">
              Why this score
            </p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.confidenceExplanation}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">What improved</p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.strongestDimensions[0]?.label ??
                'Not enough assessment data yet.'}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">What is weak</p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.weakestDimensions[0]?.label ??
                'Not enough assessment data yet.'}
            </p>
          </div>
          <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
            <p className="text-xs font-medium text-muted-copy">
              What to do next
            </p>
            <p className="mt-2 text-sm text-foreground">
              {assessment.recommendedNextMissions[0] ??
                'Complete one assessed mission in each core skill.'}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-copy">
          {assessment.certificateDisclaimer}
        </p>
      </Card>
    </div>
  );
};

export default LearningIntelligencePage;
