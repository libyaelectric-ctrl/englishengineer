import { Timestamp } from '../entities/entity.types';

export type MissionModule =
  | 'Reading'
  | 'Writing'
  | 'Listening'
  | 'Speaking'
  | 'Vocabulary'
  | 'Grammar';
export type MissionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type MissionStatus = 'available' | 'active' | 'completed' | 'locked';

export interface Mission {
  id: string;
  title: string;
  description: string;
  module: MissionModule;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  xpReward: number;
  coinReward: number;
  eloReward: number;
  status: MissionStatus;
  completedAt: Timestamp | null;
  score?: number;
}

export interface ScoreResult {
  score: number;
  xp: number;
  coins: number;
  eloChange: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  criteriaType:
    | 'first_mission'
    | 'module_count'
    | 'streak'
    | 'xp_earned'
    | 'perfect_score'
    | 'fast_learner';
  criteriaValue: number;
  moduleFilter?: MissionModule;
  unlocked: boolean;
  unlockedAt: Timestamp | null;
}

export interface StudySession {
  timestamp: Timestamp;
  durationMinutes: number;
  score: number;
  module: MissionModule;
}

export interface HistoryItem {
  date: string;
  value: number;
  module?: string;
  reason?: string;
}

export interface LearningState {
  missions: Mission[];
  achievements: Achievement[];
  xp: number;
  level: number;
  coins: number;
  elo: number;
  streak: number;
  lastActivityDate: string | null;
  studySessions: StudySession[];
  scoreHistory: { date: string; score: number; module: string }[];
  xpHistory: { date: string; amount: number; reason: string }[];
  eloHistory: { date: string; value: number }[];
}
