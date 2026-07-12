import { LearningState } from '@/core/learning';

export const createLearningState = (
  overrides: Partial<LearningState> = {}
): LearningState => ({
  missions: [],
  achievements: [],
  xp: 0,
  level: 1,
  coins: 0,
  elo: 1000,
  streak: 0,
  lastActivityDate: null,
  studySessions: [],
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
  vocabularyPool: [],
  grammarPool: [],
  ...overrides,
});
