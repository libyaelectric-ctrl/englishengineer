import { GamificationMissionTemplate } from './gamification.types';

export const LEVEL_XP_STEP = 500;

export const GAMIFICATION_MISSION_TEMPLATES: GamificationMissionTemplate[] = [
  {
    id: 'daily_reading_focus',
    title: 'Daily Reading Calibration',
    description: 'Complete one Reading learning session today.',
    cadence: 'daily',
    category: 'Reading',
    target: 1,
    xpReward: 40,
    coinReward: 10,
  },
  {
    id: 'daily_vocab_review',
    title: 'Vocabulary Review Loop',
    description: 'Review due engineering vocabulary terms.',
    cadence: 'daily',
    category: 'Vocabulary',
    target: 1,
    xpReward: 35,
    coinReward: 10,
  },
  {
    id: 'daily_ai_coach',
    title: 'AI Coach Reflection',
    description: 'Run one AI Coach review using your current weak-skill focus.',
    cadence: 'daily',
    category: 'AI Coach',
    target: 1,
    xpReward: 30,
    coinReward: 8,
  },
  {
    id: 'weekly_balanced_engine',
    title: 'Balanced Engine Rotation',
    description:
      'Complete five sessions across core learning engines this week.',
    cadence: 'weekly',
    category: 'Mixed',
    target: 5,
    xpReward: 180,
    coinReward: 45,
  },
  {
    id: 'weekly_speaking_chain',
    title: 'Speaking Confidence Chain',
    description: 'Complete three Speaking sessions this week.',
    cadence: 'weekly',
    category: 'Speaking',
    target: 3,
    xpReward: 140,
    coinReward: 35,
  },
  {
    id: 'weekly_analytics_review',
    title: 'Analytics Review Protocol',
    description:
      'Review Analytics Pro signals and follow the recommended next study.',
    cadence: 'weekly',
    category: 'Analytics',
    target: 1,
    xpReward: 60,
    coinReward: 15,
  },
  {
    id: 'monthly_engineer_elite',
    title: 'Engineer Elite Month',
    description: 'Complete twenty sessions across EngineerOS this month.',
    cadence: 'monthly',
    category: 'Mixed',
    target: 20,
    xpReward: 700,
    coinReward: 180,
  },
  {
    id: 'monthly_vocabulary_mastery',
    title: 'Vocabulary Mastery Push',
    description:
      'Build long-term retention through repeated vocabulary review.',
    cadence: 'monthly',
    category: 'Vocabulary',
    target: 10,
    xpReward: 320,
    coinReward: 90,
  },
];

export const GAMIFICATION_TITLES = [
  { threshold: 1, title: 'Junior Site Communicator' },
  { threshold: 3, title: 'Technical English Operator' },
  { threshold: 5, title: 'Engineering Communication Lead' },
  { threshold: 8, title: 'Engineer Elite' },
];
