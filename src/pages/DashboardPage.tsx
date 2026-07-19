import { useMemo, useCallback } from 'react';
import {
  BookMarked,
  BookOpen,
  Headphones,
  Languages,
  Mic2,
  PenTool,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgressService } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  SKILL_NAMES,
  type SkillName,
  useLearningCockpit,
} from '@/features/profile';
import { LessonPathEngine } from '@/features/learning-orchestrator';
import {
  buildReviewPriorities,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { DashboardSkeleton } from './DashboardPage/DashboardSkeleton';
import { DailyGoalBar } from './DashboardPage/DailyGoalBar';
import { HeroPanel } from './DashboardPage/HeroPanel';
import { ProgressCockpit } from './DashboardPage/ProgressCockpit';
import { ReviewPriorities } from './DashboardPage/ReviewPriorities';

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

const getCompetencyLabel = (score: number) => {
  if (score >= 80)
    return {
      text: 'High Competency',
      color: 'text-success dark:text-success',
    };
  if (score >= 60)
    return { text: 'Good Progress', color: 'text-primary dark:text-primary' };
  if (score >= 40)
    return {
      text: 'Developing',
      color: 'text-warning dark:text-warning',
    };
  return { text: 'Beginner', color: 'text-error dark:text-error' };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, learningState } = useLearningCockpit(
    currentUser?.id
  );
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const summary = ProgressService.getSummary(learningState);
  const focusSkill = useMemo(
    () =>
      [...SKILL_NAMES]
        .map((skill) => profile.skills[skill])
        .sort(
          (a, b) =>
            a.completedTasks - b.completedTasks ||
            b.weaknessScore - a.weaknessScore
        )[0],
    [profile]
  );
  const focusMeta = SKILL_META[focusSkill.skill];
  const primaryMission = missions[0];
  const reviewPriorities = useMemo(
    () =>
      buildReviewPriorities([
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
      ]).slice(0, 3),
    [memory, mistakeLog, focusSkill, focusMeta]
  );

  const competency = getCompetencyLabel(summary.averageScore);
  const userName = currentUser?.displayName || 'Engineer';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const skillSparklineData = useMemo(() => {
    const result: Record<SkillName, number[]> = {} as Record<
      SkillName,
      number[]
    >;
    for (const skill of SKILL_NAMES) {
      const sp = profile.skills[skill];
      const base = sp.completedTasks;
      result[skill] = Array.from({ length: 7 }, (_, i) =>
        Math.max(
          0,
          base -
            (6 - i) * Math.floor(base / 6) +
            ((i * 7 + SKILL_NAMES.indexOf(skill)) % 3)
        )
      );
    }
    return result;
  }, [profile]);

  const handleStartLesson = useCallback(
    () => navigate(primaryMission?.route ?? focusMeta.route),
    [navigate, primaryMission, focusMeta]
  );

  const isLoading = !currentUser || !profile;
  if (isLoading) return <DashboardSkeleton />;

  const focusLessonNumber = LessonPathEngine.getSkillProgress(
    profile,
    focusSkill.skill
  ).lesson.number;

  return (
    <div className="mx-auto max-w-4xl animate-aurora-fade-in space-y-6 pb-8">
      <div className="sticky top-0 z-40 border-b border-border-soft bg-background/80 backdrop-blur-xl py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>
      <div className="space-y-6">
        <DailyGoalBar />
        <HeroPanel
          userName={userName}
          greeting={greeting}
          summary={summary}
          competency={competency}
          primaryMission={primaryMission}
          focusMeta={focusMeta}
          focusSkill={focusSkill}
          focusLessonNumber={focusLessonNumber}
          onStartLesson={handleStartLesson}
        />
        <ProgressCockpit
          skillNames={SKILL_NAMES}
          skillMeta={SKILL_META}
          profile={profile}
          skillSparklineData={skillSparklineData}
        />
        <ReviewPriorities reviewPriorities={reviewPriorities} />
      </div>
    </div>
  );
};

export default DashboardPage;
