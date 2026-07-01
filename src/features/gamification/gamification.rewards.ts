import { GamificationReward } from './gamification.types';

export const LEVEL_REWARDS: GamificationReward[] = [
  {
    id: 'reward_level_2',
    title: 'Level 2 Field Brief Badge',
    description: 'Unlocks the Field Brief learner title.',
    xp: 0,
    coins: 25,
    badge: 'Field Brief',
  },
  {
    id: 'reward_level_3',
    title: 'Level 3 Coordination Badge',
    description: 'Unlocks the Coordination Ready learner title.',
    xp: 0,
    coins: 40,
    badge: 'Coordination Ready',
  },
  {
    id: 'reward_level_5',
    title: 'Level 5 Specialist Badge',
    description: 'Unlocks the Engineering English Specialist title.',
    xp: 0,
    coins: 80,
    badge: 'Specialist',
  },
  {
    id: 'reward_level_8',
    title: 'Engineer Elite Badge',
    description: 'Unlocks the Engineer Elite title.',
    xp: 0,
    coins: 150,
    badge: 'Engineer Elite',
  },
];

export const DAILY_LOGIN_REWARD: GamificationReward = {
  id: 'reward_daily_login',
  title: 'Daily Login Reward',
  description: 'Claimed for returning to EngineerOS today.',
  xp: 10,
  coins: 5,
};

export const SESSION_COMPLETION_REWARD: GamificationReward = {
  id: 'reward_session_complete',
  title: 'Session Completion Reward',
  description: 'Awarded after completing a learning session.',
  xp: 25,
  coins: 8,
};

export const PERFECT_SESSION_REWARD: GamificationReward = {
  id: 'reward_perfect_session',
  title: 'Perfect Session Bonus',
  description: 'Bonus for achieving 100% accuracy.',
  xp: 50,
  coins: 20,
};
