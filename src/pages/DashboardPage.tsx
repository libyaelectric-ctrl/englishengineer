import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Headphones,
  Languages,
  Mic2,
  PenTool,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressService } from '@/core/learning';
import { GrammarProgressService } from '@/features/grammar';
import { useAuthStore } from '@/features/auth';
import {
  LearningProfileEngine,
  SKILL_NAMES,
  type SkillName,
  useLearningCockpit,
} from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import {
  buildReviewPriorities,
  LearningMemorySummary,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { LessonPathEngine } from '@/features/learning-orchestrator';

const SKILL_META: Record<
  SkillName,
  { label: string; route: string; icon: typeof BookOpen }
> = {
  reading: { label: 'Reading', route: '/reading', icon: BookOpen },
  writing: { label: 'Writing', route: '/writing', icon: PenTool },
  listening: { label: 'Listening', route: '/listening', icon: Headphones },
  speaking: { label: 'Speaking', route: '/speaking', icon: Mic2 },
  vocabulary: { label: 'Vocabulary', route: '/vocabulary', icon: BookMarked },
  grammar: { label: 'Grammar', route: '/grammar', icon: Languages },
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, isLoading, learningState } =
    useLearningCockpit(currentUser?.id);
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const summary = ProgressService.getSummary(learningState);
  const grammarSummary = GrammarProgressService.getSummary(360);
  const badges = LearningProfileEngine.getBadges(profile, memory);
  const repeatedMistakes = mistakeLog.filter(
    (item) => (item.repetitionCount ?? 1) >= 3
  ).length;
  const focusSkill = [...SKILL_NAMES]
    .map((skill) => profile.skills[skill])
    .sort(
      (a, b) =>
        a.completedTasks - b.completedTasks || b.weaknessScore - a.weaknessScore
    )[0];
  const focusMeta = SKILL_META[focusSkill.skill];
  const primaryMission = missions[0];
  const reviewPriorities = buildReviewPriorities([
    ...(memory.weakWords > 0
      ? [
          {
            id: 'weak-words',
            label: `${memory.weakWords} weak vocabulary items`,
            source: 'weak-word' as const,
            severity: memory.weakWords,
          },
        ]
      : []),
    ...(memory.dueToday > 0
      ? [
          {
            id: 'due-words',
            label: `${memory.dueToday} vocabulary reviews due`,
            source: 'due-item' as const,
            severity: memory.dueToday,
          },
        ]
      : []),
    ...mistakeLog
      .filter((item) => (item.repetitionCount ?? 1) >= 3)
      .map((item) => ({
        id: item.id,
        label: `${item.category}: ${item.originalText}`,
        source: 'repeated-mistake' as const,
        severity: item.repetitionCount,
      })),
    {
      id: `skill-${focusSkill.skill}`,
      label: `${focusMeta.label} needs the next practice`,
      source: 'skill-weakness' as const,
      severity: Math.round(focusSkill.weaknessScore / 10),
    },
  ]).slice(0, 3);

  return (
    <div className="mx-auto grid max-w-7xl animate-aurora-fade-in gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
      <div className="min-w-0 space-y-6">
        <header className="premium-panel overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label="Starting level: A1 demo path" tone="info" />
                <StatusBadge label="Demo default" tone="neutral" />
                <StatusBadge
                  label="Skills progress separately"
                  tone="success"
                />
              </div>
              <h1 className="mt-5 text-sm font-bold text-blue-700">
                EngineerOS Mission Control
              </h1>
              <p className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Your next step is clear.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Continue one lesson at a time. Every completed task updates your
                skill level, vocabulary memory, grammar path and review plan.
              </p>
            </div>
            <Button
              type="button"
              className="min-h-12 px-6"
              onClick={() => navigate(primaryMission?.route ?? focusMeta.route)}
            >
              Start today&apos;s lesson <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-7 rounded-[16px] border border-blue-200 bg-blue-50/70 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-700">
                  TODAY&apos;S FOCUS
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {primaryMission?.title ?? `${focusMeta.label} · Lesson 1`}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {primaryMission?.reason ??
                    `Build your first reliable ${focusMeta.label} baseline.`}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-2xl font-black text-slate-950">
                  {focusSkill.cefrBand}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Lesson{' '}
                  {
                    LessonPathEngine.getSkillProgress(profile, focusSkill.skill)
                      .lesson.number
                  }
                </p>
              </div>
            </div>
          </div>

          <div
            data-testid="dashboard-summary-metrics"
            className="mt-5 grid grid-cols-3 gap-2 sm:gap-3"
          >
            <div
              data-testid="dashboard-summary-score"
              className="min-w-0 rounded-[14px] border border-slate-200 bg-white p-3 sm:p-4"
            >
              <p className="text-[10px] font-bold text-slate-500">AVG SCORE</p>
              <p className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">
                {summary.averageScore}%
              </p>
            </div>
            <div
              data-testid="dashboard-summary-elo"
              className="min-w-0 rounded-[14px] border border-slate-200 bg-white p-3 sm:p-4"
            >
              <p className="text-[10px] font-bold text-slate-500">
                FOCUS LEVEL
              </p>
              <p className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">
                {focusSkill.cefrBand}
              </p>
            </div>
            <div
              data-testid="dashboard-summary-done"
              className="min-w-0 rounded-[14px] border border-slate-200 bg-white p-3 sm:p-4"
            >
              <p className="text-[10px] font-bold text-slate-500">COMPLETED</p>
              <p className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">
                {summary.completionPercentage}%
              </p>
            </div>
          </div>
        </header>

        <SectionCard
          title="Your skills"
          subtitle="Each skill starts at A1 and advances at its own pace"
          icon={Target}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_NAMES.map((skill) => {
              const skillProfile = profile.skills[skill];
              const meta = SKILL_META[skill];
              const Icon = meta.icon;
              const lesson = LessonPathEngine.getSkillProgress(profile, skill)
                .lesson.number;
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => navigate(meta.route)}
                  className="group min-w-0 rounded-[15px] border border-slate-200 bg-white p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-[11px] border border-blue-100 bg-blue-50 p-2 text-blue-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-lg font-black text-slate-950">
                      {skillProfile.cefrBand}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-black text-slate-950">
                    {meta.label}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Lesson {lesson}</span>
                    <span>{skillProfile.progressToNextBand}%</span>
                  </div>
                  <ProgressBar
                    value={skillProfile.progressToNextBand}
                    className="mt-3"
                  />
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Needs attention"
          subtitle="The clearest places to improve next"
          icon={Target}
        >
          <div
            data-testid="dashboard-review-summary"
            className="grid gap-3 md:grid-cols-3"
          >
            {reviewPriorities.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate('/curriculum#review')}
                className="rounded-[14px] border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/60"
              >
                <StatusBadge
                  label={index === 0 ? 'Start here' : `Priority ${index + 1}`}
                  tone={index === 0 ? 'warning' : 'neutral'}
                />
                <p className="mt-3 text-sm font-black text-slate-900">
                  {item.label}
                </p>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <aside
        data-testid="dashboard-right-panel"
        className="premium-panel h-fit border-l border-l-slate-300 p-5 xl:sticky xl:top-6"
      >
        <div>
          <p className="text-xs font-bold text-blue-700">LEARNING MEMORY</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Everything you learn stays connected.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Vocabulary, grammar, repeated mistakes and achievements feed your
            next recommendations.
          </p>
        </div>
        <div data-testid="dashboard-vocabulary-progress" className="mt-5">
          <LearningMemorySummary
            vocabulary={memory}
            grammar={grammarSummary}
            repeatedMistakes={repeatedMistakes}
            badges={badges}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => navigate('/curriculum')}
          disabled={isLoading}
        >
          Open Learning Hub <ArrowRight className="h-4 w-4" />
        </Button>
      </aside>
    </div>
  );
};

export default DashboardPage;
