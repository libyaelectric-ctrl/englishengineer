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
import { useAuthStore } from '@/features/auth';
import {
  SKILL_NAMES,
  type SkillName,
  useLearningCockpit,
} from '@/features/profile';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { PageHeader } from '@/shared/components/PageHeader';
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

  return (
    <div className="mx-auto max-w-4xl animate-aurora-fade-in space-y-6">
      <PageHeader 
        title="Command Center" 
        description="Your next step is clear. Continue one lesson at a time."
      />
      <div className="space-y-6">
        {/* Executive Summary Widget */}
        <div className="rounded-card border border-border-soft bg-surface/50 p-4 shadow-sm flex items-center justify-between animate-on-scroll">
          <div className="flex items-center gap-4 w-full">
            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-black text-xl shadow-inner">
              85
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1.5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Engineering Readiness Score</h3>
                  <p className="text-[10px] font-medium text-muted-copy">Based on communication, technical vocabulary, and scenario performance.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                    <Target className="w-3 h-3"/> High Competency
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-surface-hover overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000 relative" style={{ width: '85%' }}>
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
                <p className="text-xl font-bold text-foreground">
                  {focusSkill.cefrBand}
                </p>
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
              <p className="mt-1 truncate text-lg font-bold text-foreground sm:text-xl">
                {focusSkill.cefrBand}
              </p>
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
          title="Your skills"
          subtitle="Each skill starts at A1 and advances at its own pace"
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
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => navigate(meta.route)}
                  className="group min-w-0 rounded-card border border-border-soft bg-surface p-4 text-left transition-all hover:border-border-hover hover:bg-surface-hover/20 card-interactive"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-[8px] border border-border-soft bg-surface-hover p-1.5 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {skillProfile.cefrBand}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-bold text-foreground">
                    {meta.label}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-copy">
                    <span>Lesson {lesson}</span>
                    <span>{skillProfile.progressToNextBand}%</span>
                  </div>
                  <ProgressBar
                    value={skillProfile.progressToNextBand}
                    className="mt-2.5"
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
