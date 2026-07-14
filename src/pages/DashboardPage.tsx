import { useMemo } from 'react';
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
import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  SKILL_NAMES,
  type SkillName,
  useLearningCockpit,
  getEloBandRange,
} from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Skeleton } from '@/shared/components/Skeleton';
import {
  buildReviewPriorities,
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

const Sparkline = ({ data, className = '' }: { data: number[]; className?: string }) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`${className}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
};

const DashboardSkeleton = () => (
  <div className="mx-auto max-w-4xl space-y-6 pb-8">
    <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <Skeleton className="h-7 w-40" />
    </div>
    <div className="space-y-6">
      <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>
      </div>
      <div className="premium-panel overflow-hidden p-6 sm:p-8">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-3 h-8 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
        <Skeleton className="mt-6 h-12 w-full" />
      </div>
      <SectionCard title="Progress Cockpit" subtitle="" icon={Target}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-card border border-border-soft bg-surface p-4 space-y-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  </div>
);

const getCefrColor = (band: string) => {
  if (band.startsWith('C')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (band.startsWith('B')) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-blue-600 bg-blue-50 border-blue-200';
};

const DAILY_GOAL = 10;

const DailyGoalBar = () => {
  const learningState = useLearningStore();
  const today = new Date().toDateString();
  const todayCount = learningState.studySessions.filter(
    (s) => new Date(s.timestamp).toDateString() === today
  ).length;
  return (
    <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm animate-on-scroll">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-foreground">
          Today: {todayCount}/{DAILY_GOAL} tasks completed
        </span>
        <span className="text-[10px] font-medium text-muted-copy">
          {Math.min(todayCount, DAILY_GOAL)}/{DAILY_GOAL}
        </span>
      </div>
      <ProgressBar
        value={Math.min(todayCount, DAILY_GOAL)}
        max={DAILY_GOAL}
        color={todayCount >= DAILY_GOAL ? 'emerald' : 'primary'}
      />
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const summary = ProgressService.getSummary(learningState);
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

  const getCompetencyLabel = (score: number) => {
    if (score >= 80) return { text: 'High Competency', color: 'text-green-500' };
    if (score >= 60) return { text: 'Good Progress', color: 'text-blue-500' };
    if (score >= 40) return { text: 'Developing', color: 'text-amber-500' };
    return { text: 'Beginner', color: 'text-rose-500' };
  };
  const competency = getCompetencyLabel(summary.averageScore);

  const userName = currentUser?.displayName || 'Engineer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const isLoading = !currentUser || !profile;

  const skillSparklineData = useMemo(() => {
    const result: Record<SkillName, number[]> = {} as Record<SkillName, number[]>;
    for (const skill of SKILL_NAMES) {
      const sp = profile.skills[skill];
      const base = sp.completedTasks;
      result[skill] = Array.from({ length: 7 }, (_, i) =>
        Math.max(0, base - (6 - i) * Math.floor(base / 6) + Math.floor(Math.random() * 3))
      );
    }
    return result;
  }, [profile]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-4xl animate-aurora-fade-in space-y-6 pb-8">
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background py-3 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Dashboard</h1>
      </div>
      <div className="space-y-6">
        <DailyGoalBar />

        {/* Executive Summary Widget */}
        <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm flex items-center justify-between animate-on-scroll">
          <div className="flex items-center gap-4 w-full">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-black text-xl shadow-inner">
              {summary.averageScore}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Engineering Readiness Score
                  </h3>
                  <p className="text-[10px] font-medium text-muted-copy">
                    Based on communication, technical vocabulary, and scenario
                    performance.
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold ${competency.color} flex items-center gap-1`}>
                    <Target className="w-3 h-3" /> {competency.text}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000 relative"
                  style={{ width: `${summary.averageScore}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <header className="premium-panel overflow-hidden p-6 sm:p-8 animate-on-scroll">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <StatusBadge label="Starting level: A1 demo path" tone="info" />
                <StatusBadge label="Demo default" tone="neutral" />
                <StatusBadge
                  label="Skills progress separately"
                  tone="success"
                />
              </div>
              <p className="text-lg font-bold text-foreground">Good {greeting}, {userName}!</p>
              <h1 className="mt-5 text-xs font-bold text-primary uppercase tracking-wider">
                EngVox Command Center
              </h1>
              <p className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                Your next step is clear.
              </p>
              <p className="mt-2 max-w-xl text-xs leading-5 text-muted-copy">
                Continue one lesson at a time. Every completed task updates your
                skill level, vocabulary memory, grammar path and review plan.
              </p>
            </div>
            <Button
              type="button"
              className="min-h-10 px-5 text-xs btn-press"
              onClick={() => navigate(primaryMission?.route ?? focusMeta.route)}
            >
              Start today&apos;s lesson <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-6 rounded-card border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  TODAY&apos;S FOCUS
                </p>
                <h2 className="mt-1 text-lg font-bold text-foreground">
                  {primaryMission?.title ?? `${focusMeta.label} · Lesson 1`}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-copy">
                  {primaryMission?.reason ??
                    `Build your first reliable ${focusMeta.label} baseline.`}
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-bold ${getCefrColor(focusSkill.cefrBand)}`}>
                  {focusSkill.cefrBand}
                </span>
                <p className="text-[10px] font-semibold text-muted-copy">
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
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <div
              data-testid="dashboard-summary-score"
              className="min-w-0 rounded-card border border-border-soft bg-surface/50 p-4"
            >
              <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                COMPETENCY INDEX
              </p>
              <p className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">
                {summary.averageScore}%
              </p>
            </div>
            <div
              data-testid="dashboard-summary-elo"
              className="min-w-0 rounded-card border border-border-soft bg-surface/50 p-4"
            >
              <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                TARGET LEVEL
              </p>
              <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${getCefrColor(focusSkill.cefrBand)}`}>
                {focusSkill.cefrBand}
              </span>
            </div>
            <div
              data-testid="dashboard-summary-done"
              className="min-w-0 rounded-card border border-border-soft bg-surface/50 p-4"
            >
              <p className="text-[9px] font-bold text-muted-copy uppercase tracking-wider">
                COMPLETION RATE
              </p>
              <p className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">
                {summary.completionPercentage}%
              </p>
            </div>
          </div>
        </header>

        <SectionCard
          title="Progress Cockpit"
          subtitle={`${SKILL_NAMES.length} skills tracked — Detailed ELO, CEFR, and Global progression`}
          icon={Target}
          className="animate-on-scroll"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_NAMES.map((skill) => {
              const skillProfile = profile.skills[skill];
              const meta = SKILL_META[skill];
              const Icon = meta.icon;
              const lesson = LessonPathEngine.getSkillProgress(profile, skill)
                .lesson.number;
              const isSimulated = skill === 'listening' || skill === 'speaking';

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => navigate(meta.route)}
                  className="group min-w-0 rounded-card border border-border-soft bg-surface p-4 text-left transition-all hover:border-border-hover hover:bg-surface-hover/20 card-interactive relative transition-transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-[8px] border border-border-soft bg-surface-hover p-1.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-foreground">
                        {meta.label}
                      </span>
                      <span className="block text-[10px] font-medium text-muted-copy">
                        Lesson {lesson}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] text-muted-copy leading-4">
                    {isSimulated
                      ? skill === 'listening'
                        ? 'Simulated listening talks. Available for practice.'
                        : 'Simulated site meeting discussions. Available for practice.'
                      : `Accuracy: ${skillProfile.accuracy}%. Completed Tasks: ${skillProfile.completedTasks}.`}
                  </p>

                  <Sparkline
                    data={skillSparklineData[skill]}
                    className="w-full h-6 text-primary/40"
                  />

                  <div className="mt-4 space-y-3">
                    {/* Current Band Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end px-1">
                        <div className="flex flex-col items-start">
                          <span className="text-[8px] uppercase tracking-widest text-muted-copy/70">
                            Min
                          </span>
                          <span className="text-[10px] font-medium text-muted-copy">
                            {getEloBandRange(skillProfile.cefrBand).min}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-foreground">
                            {skillProfile.elo} ELO
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] uppercase tracking-widest text-muted-copy/70">
                            Max
                          </span>
                          <span className="text-[10px] font-medium text-muted-copy">
                            {getEloBandRange(skillProfile.cefrBand).max}
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        value={skillProfile.progressToNextBand}
                        showValue={false}
                        color="cyan"
                        className=""
                      />
                      <div className="flex justify-between items-center px-1 pt-0.5">
                        <span className="text-[10px] font-bold text-primary">
                          {skillProfile.cefrBand} Level
                        </span>
                        <span className="text-[9px] font-medium text-muted-copy">
                          {skillProfile.progressToNextBand}% to next level
                        </span>
                      </div>
                    </div>

                    {/* Global Progress */}
                    <div className="space-y-1.5 border-t border-border-soft/50 pt-2.5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-medium text-muted-copy">
                          Global Progress (A1 - C2+)
                        </span>
                        <span className="text-[9px] font-bold text-foreground">
                          {Math.round(((skillProfile.elo - 1000) / 4000) * 100)}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        value={((skillProfile.elo - 1000) / 4000) * 100}
                        showValue={false}
                        color="emerald"
                        className="h-1.5"
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] text-muted-copy/70">
                          1000 ELO (A1)
                        </span>
                        <span className="text-[8px] text-muted-copy/70">
                          5000 ELO (C2+)
                        </span>
                      </div>
                    </div>
                  </div>
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
            {reviewPriorities.length === 0 && (
              <p className="text-sm text-muted-copy col-span-3 text-center py-6">
                No weak areas detected. Keep practicing!
              </p>
            )}
            {reviewPriorities.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate('/curriculum#review')}
                className="rounded-card border border-border-soft bg-surface p-4 text-left transition-all hover:border-border-hover hover:bg-surface-hover/20"
              >
                <StatusBadge
                  label={index === 0 ? 'Start here' : `Priority ${index + 1}`}
                  tone={index === 0 ? 'warning' : 'neutral'}
                />
                <p className="mt-3 text-xs font-bold text-foreground">
                  {item.label}
                </p>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default DashboardPage;
