import { INITIAL_ELO } from '../learning.store.helpers';
import type { LearningState } from '../learning.types';

export type ProgressState = Pick<
  LearningState,
  | 'elo'
  | 'streak'
  | 'lastActivityDate'
  | 'studySessions'
  | 'scoreHistory'
  | 'xpHistory'
  | 'eloHistory'
>;

export const createInitialProgressState = (): ProgressState => ({
  elo: INITIAL_ELO,
  streak: 0,
  lastActivityDate: null,
  studySessions: [],
  scoreHistory: [],
  xpHistory: [],
  eloHistory: [],
});
