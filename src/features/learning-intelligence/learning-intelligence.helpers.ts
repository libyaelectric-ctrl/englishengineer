import { LearningState } from '@/core/learning/learning.types';
import { AssessmentProfile } from '@/features/assessment';
import { CefrLevel } from '@/features/level-system';
import {
  BASE_DAILY_TASKS,
  ROLE_PRIORITY,
  ROLE_RECOMMENDATIONS,
} from './learning-intelligence.data';
import {
  CareerRole,
  DailyCommunicationTask,
  MistakeLogEntry,
  SevenDayProgressReport,
} from './learning-intelligence.types';

export const getTasksForRole = (role: CareerRole): DailyCommunicationTask[] => {
  const priority = ROLE_PRIORITY[role];
  return [...BASE_DAILY_TASKS].sort(
    (left, right) =>
      priority.indexOf(left.module) - priority.indexOf(right.module)
  );
};

export const getPersonalizedTasks = (
  role: CareerRole,
  level: CefrLevel,
  weakArea: string,
  mistakes: MistakeLogEntry[],
  completedTaskDates: Record<string, string>
): DailyCommunicationTask[] => {
  const today = new Date().toISOString().slice(0, 10);
  const weakModule = BASE_DAILY_TASKS.find((task) =>
    weakArea.toLowerCase().includes(task.module.toLowerCase())
  )?.module;
  const hasLanguageMistake = mistakes.some((mistake) =>
    ['grammar', 'word choice', 'preposition', 'article'].includes(
      mistake.category
    )
  );

  return getTasksForRole(role)
    .map((task) => ({
      ...task,
      level,
      description: `${task.description} ${level} focus for ${role}.`,
    }))
    .sort((left, right) => {
      const leftCompleted = completedTaskDates[left.id] === today ? 1 : 0;
      const rightCompleted = completedTaskDates[right.id] === today ? 1 : 0;
      if (leftCompleted !== rightCompleted)
        return leftCompleted - rightCompleted;
      if (left.module === weakModule) return -1;
      if (right.module === weakModule) return 1;
      if (hasLanguageMistake && left.module === 'Writing') return -1;
      if (hasLanguageMistake && right.module === 'Writing') return 1;
      return 0;
    });
};

export const isTaskCompletedToday = (
  taskId: string,
  completedTaskDates: Record<string, string>,
  today = new Date().toISOString().slice(0, 10)
): boolean => completedTaskDates[taskId] === today;

const computeModuleAverages = (
  recentSessions: LearningState['studySessions']
): { module: string; score: number }[] => {
  const moduleScores = new Map<string, number[]>();
  recentSessions.forEach((session) => {
    const values = moduleScores.get(session.module) ?? [];
    values.push(session.score);
    moduleScores.set(session.module, values);
  });
  return [...moduleScores.entries()].map(([module, scores]) => ({
    module,
    score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
  }));
};

const computeRepeatedMistakes = (
  mistakes: MistakeLogEntry[]
): { repeated: string[]; topMistake: string } => {
  const categoryCounts = mistakes.reduce<Record<string, number>>(
    (counts, mistake) => {
      counts[mistake.category] = (counts[mistake.category] ?? 0) + 1;
      return counts;
    },
    {}
  );
  const repeated = Object.entries(categoryCounts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
    .slice(0, 3);
  const topMistake =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    'No repeated pattern identified';
  return { repeated, topMistake };
};

const ROLE_PHRASE_MAP: Record<CareerRole, string> = {
  'Procurement Engineer': 'Procurement',
  'Commissioning Engineer': 'Commissioning',
  'HSE Engineer': 'HSE',
  'QA/QC Engineer': 'QA/QC',
  'Electrical Works Chief': 'Coordination',
  'MEP Coordinator': 'Coordination',
  'Site Engineer': 'Coordination',
  'Data Center Engineer': 'Coordination',
  'Project Manager': 'Coordination',
};

const getRecommendedPhrase = (careerRole: CareerRole): string =>
  ROLE_PHRASE_MAP[careerRole] ?? 'Coordination';

const getQuickAIAction = (topMistake: string): string => {
  if (topMistake === 'tone') return 'More polite';
  if (topMistake === 'grammar' || topMistake === 'article')
    return 'Explain mistakes';
  return 'More professional';
};

export const buildSevenDayReport = (
  learning: LearningState,
  assessment: AssessmentProfile,
  completedTaskDates: Record<string, string>,
  mistakes: MistakeLogEntry[],
  careerRole: CareerRole,
  currentLevel: CefrLevel,
  now = new Date()
): SevenDayProgressReport => {
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - 6);
  threshold.setHours(0, 0, 0, 0);
  const recentSessions = learning.studySessions.filter(
    (session) => new Date(session.timestamp).getTime() >= threshold.getTime()
  );

  const averages = computeModuleAverages(recentSessions);
  const strongest =
    [...averages].sort((a, b) => b.score - a.score)[0]?.module ??
    'Collecting evidence';
  const weakest =
    [...averages].sort((a, b) => a.score - b.score)[0]?.module ??
    'Not enough recent data';

  const { repeated, topMistake: topRepeatedMistake } =
    computeRepeatedMistakes(mistakes);

  const completedTasks = Object.values(completedTaskDates).filter(
    (date) => new Date(date).getTime() >= threshold.getTime()
  ).length;

  return {
    completedTasks,
    improvedSkill: strongest,
    weakArea: weakest,
    repeatedMistakes: repeated,
    nextWeekFocus:
      weakest === 'Not enough recent data'
        ? 'Complete one task in each core skill'
        : `Strengthen ${weakest} with three focused sessions`,
    eloEstimate: learning.elo,
    cefrEstimate: assessment.engineerCefr ?? `${currentLevel} learning path`,
    recommendedNextTasks: ROLE_RECOMMENDATIONS[careerRole].slice(0, 5),
    currentLevel,
    topRepeatedMistake,
    recommendedWorkTools: ROLE_RECOMMENDATIONS[careerRole][0],
    recommendedQuickAIAction: getQuickAIAction(topRepeatedMistake),
    recommendedPhraseCategory: getRecommendedPhrase(careerRole),
  };
};
