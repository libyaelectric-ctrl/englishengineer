import { LearningState, MissionModule } from '@/core/learning';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/error-codes';
import {
  CEFR_LEVELS,
  CefrLevel,
  ContentAccessLabel,
  ContentLevelFilter,
  EngineeringLevelProfile,
  LevelConfidence,
  LevelPathNode,
  SkillKey,
  SkillLevelProgress,
  LevelledContent,
} from './level-system.types';

const CORE_SKILLS: SkillKey[] = [
  'reading',
  'writing',
  'listening',
  'speaking',
  'vocabulary',
];

const MODULE_BY_SKILL: Partial<Record<SkillKey, MissionModule>> = {
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  vocabulary: 'Vocabulary',
};

export const getNextCefrLevel = (level: CefrLevel): CefrLevel | null => {
  const next = CEFR_LEVELS.indexOf(level) + 1;
  return CEFR_LEVELS[next] ?? null;
};

export const getLevelConfidence = (
  completedTasks: number,
  isDemo: boolean
): LevelConfidence => {
  if (isDemo || completedTasks === 0) return 'demo';
  if (completedTasks < 10) return 'estimated';
  return 'calibrated';
};

const getLevelIndex = (
  completedTasks: number,
  averageScore: number
): number => {
  if (completedTasks < 10 || averageScore < 65) return 0;
  return Math.min(Math.floor(completedTasks / 10), CEFR_LEVELS.length - 1);
};

export const calculateSkillProgress = (
  skill: SkillKey,
  learning: LearningState,
  isDemo: boolean
): SkillLevelProgress => {
  if (isDemo || skill === 'workTools' || skill === 'quickAI') {
    return {
      skill,
      currentLevel: 'A1',
      completedTasks: 0,
      requiredTasksForNextLevel: 10,
      nextLevel: 'A2',
      confidence: 'demo',
    };
  }

  const module = MODULE_BY_SKILL[skill];
  const sessions = module
    ? learning.studySessions.filter((session) => session.module === module)
    : [];
  const completedTasks = sessions.length;
  const averageScore = completedTasks
    ? sessions.reduce((sum, session) => sum + session.score, 0) / completedTasks
    : 0;
  const levelIndex = getLevelIndex(completedTasks, averageScore);
  const currentLevel = CEFR_LEVELS[levelIndex];
  const nextLevel = getNextCefrLevel(currentLevel);
  const nextThreshold = Math.min((levelIndex + 1) * 10, 50);

  return {
    skill,
    currentLevel,
    completedTasks,
    requiredTasksForNextLevel: nextLevel
      ? Math.max(0, nextThreshold - completedTasks)
      : 0,
    nextLevel,
    confidence: getLevelConfidence(completedTasks, false),
  };
};

export const buildLevelProfile = (
  learning: LearningState,
  userId?: string
): EngineeringLevelProfile => {
  const isDemo = !userId || userId.startsWith('demo_');
  const coreProgress = CORE_SKILLS.map((skill) =>
    calculateSkillProgress(skill, learning, isDemo)
  );
  const overallIndex = Math.min(
    ...coreProgress.map((progress) =>
      CEFR_LEVELS.indexOf(progress.currentLevel)
    )
  );
  const overallLevel = CEFR_LEVELS[Math.max(0, overallIndex)];
  const totalTasks = coreProgress.reduce(
    (sum, progress) => sum + progress.completedTasks,
    0
  );
  const confidence = getLevelConfidence(totalTasks, isDemo);
  const supportingSkills: SkillLevelProgress[] = [
    {
      ...calculateSkillProgress('workTools', learning, isDemo),
      currentLevel: overallLevel,
      confidence,
    },
    {
      ...calculateSkillProgress('quickAI', learning, isDemo),
      currentLevel: overallLevel,
      confidence,
    },
  ];

  return {
    overallLevel,
    confidence,
    isDemo,
    skills: [...coreProgress, ...supportingSkills],
    explanation: isDemo
      ? 'Starting level: A1 demo path. Complete real tasks to create an estimate.'
      : confidence === 'calibrated'
        ? 'Level calibrated from completed Engineering Communication tasks.'
        : 'Level not calibrated yet. Complete tasks to improve the estimate.',
  };
};

export const buildSequentialLevelPath = (
  progress: SkillLevelProgress
): LevelPathNode[] => {
  const currentIndex = CEFR_LEVELS.indexOf(progress.currentLevel);
  return CEFR_LEVELS.map((level, index) => {
    if (index < currentIndex) {
      return {
        level,
        status: 'completed',
        reason: 'Level requirements completed',
      };
    }
    if (index === currentIndex) {
      return { level, status: 'current', reason: 'Current learning level' };
    }
    if (
      index === currentIndex + 1 &&
      progress.requiredTasksForNextLevel === 0
    ) {
      return { level, status: 'available', reason: 'Ready to start' };
    }
    if (index >= 4 && currentIndex < 3) {
      return {
        level,
        status: 'preview-only',
        reason: `Advanced / ${level} preview. Complete B2 tasks first`,
      };
    }
    return {
      level,
      status: 'locked',
      reason: `Complete ${CEFR_LEVELS[index - 1]} tasks first`,
    };
  });
};

export const getConfidenceLabel = (confidence: LevelConfidence): string => {
  if (confidence === 'demo') return 'Demo default';
  if (confidence === 'estimated') return 'Estimated';
  return 'Calibrated';
};

export const getSkillProgress = (
  profile: EngineeringLevelProfile,
  skill: SkillKey
): SkillLevelProgress => {
  const progress = profile.skills.find((item) => item.skill === skill);
  if (!progress)
    throw new AppError({
      code: ErrorCode.VALIDATION,
      message: `Missing level progress for ${skill}`,
    });
  return progress;
};

export const getContentAccessLabel = (
  contentLevel: CefrLevel,
  currentLevel: CefrLevel
): ContentAccessLabel => {
  const contentIndex = CEFR_LEVELS.indexOf(contentLevel);
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
  if (contentIndex < currentIndex) return 'Review';
  if (contentIndex === currentIndex) return 'Current';
  if (contentIndex === currentIndex + 1) return 'Preview';
  return 'Locked';
};

export const filterContentByLevel = <T extends LevelledContent>(
  items: T[],
  currentLevel: CefrLevel,
  filter: ContentLevelFilter
): T[] => {
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel);
  if (filter === 'all-levels') return items;
  if (filter === 'review-previous') {
    return items.filter(
      (item) => CEFR_LEVELS.indexOf(item.cefrLevel) < currentIndex
    );
  }
  if (filter === 'preview-next') {
    return items.filter(
      (item) => CEFR_LEVELS.indexOf(item.cefrLevel) === currentIndex + 1
    );
  }
  return items.filter((item) => item.cefrLevel === currentLevel);
};

export const resolveActiveLevelContent = <
  T extends LevelledContent & { id: string },
>(
  visibleItems: T[],
  selectedId: string | null
): T | null =>
  visibleItems.find((item) => item.id === selectedId) ??
  visibleItems[0] ??
  null;

export const canOpenLevelContent = (
  contentLevel: CefrLevel,
  currentLevel: CefrLevel,
  filter: ContentLevelFilter
): boolean =>
  filter === 'all-levels' ||
  getContentAccessLabel(contentLevel, currentLevel) !== 'Locked';
