import { BookMarked, BookOpen, Headphones, Languages, Mic2, PenTool } from 'lucide-react';

import { useCallback, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { ProgressService } from '@/core/learning';

import { StreakFlameWidget } from '@/shared/components/StreakFlameWidget';
import {
  DISCIPLINE_META,
  type EngineeringDiscipline,
} from '@/shared/constants/engineering-disciplines';

import { useAuthStore } from '@/features/auth';
import {
  buildReviewPrioritiesFromInput,
  useLearningIntelligenceStore,
} from '@/features/learning-intelligence';
import { LessonPathEngine } from '@/features/learning-orchestrator';
import { useLocalizationStore } from '@/features/localization';
import { SKILL_NAMES, type SkillName, useLearningCockpit } from '@/features/profile';
import { DashboardTranslatorWidget } from '@/features/translation';

import { DailyGoalBar } from './DailyGoalBar';
import { DashboardSkeleton } from './DashboardSkeleton';
import { HeroPanel } from './HeroPanel';
import { ProgressCockpit } from './ProgressCockpit';
import { ReviewPriorities } from './ReviewPriorities';
import { SkillRadarChart } from './SkillRadarChart';

const COMPETENCY_HIGH_THRESHOLD = 80;
const COMPETENCY_GOOD_THRESHOLD = 60;
const COMPETENCY_DEVELOPING_THRESHOLD = 40;
const STREAK_DAYS = 7;

const SKILL_ICONS: Record<SkillName, typeof BookOpen> = {
  reading: BookOpen,
  writing: PenTool,
  listening: Headphones,
  speaking: Mic2,
  vocabulary: BookMarked,
  grammar: Languages,
};

const SKILL_ROUTES: Record<SkillName, string> = {
  reading: '/reading',
  writing: '/writing',
  listening: '/listening',
  speaking: '/speaking',
  vocabulary: '/vocabulary',
  grammar: '/grammar',
};

const SKILL_I18N_KEYS: Record<
  SkillName,
  | 'nav.reading'
  | 'nav.writing'
  | 'nav.listening'
  | 'nav.speaking'
  | 'nav.vocabulary'
  | 'nav.grammar'
> = {
  reading: 'nav.reading',
  writing: 'nav.writing',
  listening: 'nav.listening',
  speaking: 'nav.speaking',
  vocabulary: 'nav.vocabulary',
  grammar: 'nav.grammar',
};

const getCompetencyLabel = (score: number) => {
  if (score >= COMPETENCY_HIGH_THRESHOLD)
    return {
      textKey: 'dashboard.highCompetency' as const,
      color: 'text-success dark:text-success',
    };
  if (score >= COMPETENCY_GOOD_THRESHOLD)
    return { textKey: 'dashboard.goodProgress' as const, color: 'text-primary dark:text-primary' };
  if (score >= COMPETENCY_DEVELOPING_THRESHOLD)
    return {
      textKey: 'dashboard.developing' as const,
      color: 'text-warning dark:text-warning',
    };
  return { textKey: 'dashboard.beginner' as const, color: 'text-error dark:text-error' };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const currentUser = useAuthStore((state) => state.currentUser);
  const { profile, memory, missions, learningState } = useLearningCockpit(currentUser?.id);
  const mistakeLog = useLearningIntelligenceStore((state) => state.mistakeLog);
  const summary = ProgressService.getSummary(learningState);

  const discipline: EngineeringDiscipline =
    (profile?.discipline as EngineeringDiscipline) ?? 'electrical';
  const disciplineMeta = DISCIPLINE_META[discipline];

  const skillMeta = useMemo(() => {
    const result = {} as Record<SkillName, { label: string; route: string; icon: typeof BookOpen }>;
    for (const key of SKILL_NAMES) {
      result[key] = {
        label: translate(SKILL_I18N_KEYS[key]),
        route: SKILL_ROUTES[key],
        icon: SKILL_ICONS[key],
      };
    }
    return result;
  }, [translate]);

  const focusSkill = useMemo(
    () =>
      [...SKILL_NAMES]
        .map((skill) => profile.skills[skill])
        .sort(
          (a, b) => a.completedTasks - b.completedTasks || b.weaknessScore - a.weaknessScore
        )[0],
    [profile]
  );
  const focusMeta = skillMeta[focusSkill.skill];
  const primaryMission = missions[0];
  const reviewPriorities = useMemo(
    () =>
      buildReviewPrioritiesFromInput({
        weakWords: memory.weakWords,
        dueToday: memory.dueToday,
        mistakeLog,
        focusSkill: {
          skill: focusSkill.skill,
          weaknessScore: focusSkill.weaknessScore,
          label: focusMeta.label,
        },
      }),
    [memory, mistakeLog, focusSkill, focusMeta]
  );

  const competency = getCompetencyLabel(summary.averageScore);
  const competencyText = translate(competency.textKey);
  const userName = currentUser?.displayName || 'Engineer';

  const skillSparklineData = useMemo(() => {
    const result: Record<SkillName, number[]> = {} as Record<SkillName, number[]>;
    for (const skill of SKILL_NAMES) {
      const sp = profile.skills[skill];
      const base = sp.completedTasks;
      result[skill] = Array.from({ length: 7 }, (_, i) =>
        Math.max(
          0,
          base - (6 - i) * Math.floor(base / 6) + ((i * 7 + SKILL_NAMES.indexOf(skill)) % 3)
        )
      );
    }
    return result;
  }, [profile]);

  const handleStartLesson = useCallback(
    () => navigate(primaryMission?.route ?? focusMeta.route),
    [navigate, primaryMission, focusMeta]
  );

  const isLoading = !profile;
  if (isLoading) return <DashboardSkeleton />;

  const focusLessonNumber = LessonPathEngine.getSkillProgress(profile, focusSkill.skill).lesson
    .number;

  return (
    <div className="mx-auto w-full max-w-4xl animate-aurora-fade-in space-y-6 pb-8">
      <div className="sticky top-0 z-20 border-b border-border-soft bg-background/95 backdrop-blur-xl py-3.5 mb-6">
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {translate('dashboard.title')}
        </h1>
      </div>
      <div className="space-y-6">
        <StreakFlameWidget streakDays={STREAK_DAYS} freezeAvailable={true} />
        <DailyGoalBar />
        <HeroPanel
          userName={userName}
          summary={summary}
          competency={{ text: competencyText, color: competency.color }}
          primaryMission={primaryMission}
          focusMeta={focusMeta}
          focusSkill={focusSkill}
          focusLessonNumber={focusLessonNumber}
          onStartLesson={handleStartLesson}
          disciplineLabel={translate(disciplineMeta.labelKey as any)}
          disciplineWordCount={disciplineMeta.wordCount + 3088}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <SkillRadarChart profile={profile} />
          <ReviewPriorities reviewPriorities={reviewPriorities} />
        </div>
        <ProgressCockpit
          skillNames={SKILL_NAMES}
          skillMeta={skillMeta}
          profile={profile}
          skillSparklineData={skillSparklineData}
        />
        {/* Independent Instant Engineering Translator Section */}
        <section className="pt-2">
          <DashboardTranslatorWidget />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
