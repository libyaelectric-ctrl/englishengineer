import { MissionDifficulty } from '@/core/learning/learning.types';
import { CefrLevel } from '@/features/level-system';

export type QuestionType =
  | 'multiple_choice'
  | 'short_answer'
  | 'keyword_answer'
  | 'true_false';

export interface ReadingQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  choices?: string[]; // relevant for multiple_choice
  correctAnswer: string; // for multiple_choice ('A', 'B'...), true_false ('true' or 'false'), others are text
  keywords?: string[]; // for keyword_answer or short_answer similarity check
  explanation: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
  context: string;
  turkishTranslation?: string;
}

export interface ReadingMission {
  id: string;
  title: string;
  description: string;
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  passageText: string;
  vocabulary: VocabularyItem[];
  questions: ReadingQuestion[];
  xpReward: number;
  coinReward: number;
  eloReward: number;
  sequenceNumber?: number;
  sourceMetadata?: {
    origin: 'EngVox original';
    author: string;
    schemaVersion: number;
  };
}

export interface ReadingSubmission {
  missionId: string;
  answers: Record<string, string>; // questionId -> user input
  timeSpentMinutes: number;
}

export interface DetailedAnswerFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ReadingEvaluationResult {
  missionId: string;
  comprehensionScore: number;
  vocabularyScore: number;
  technicalAccuracyScore: number;
  finalScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  detailedAnswers: DetailedAnswerFeedback[];
}

export interface ReadingHistoryEntry {
  missionId: string;
  timestamp: string;
  score: number;
  evaluation: ReadingEvaluationResult;
}

export interface ReadingState {
  completedMissions: Record<string, number>; // missionId -> best score
  lastSelectedMissionId: string | null;
  history: ReadingHistoryEntry[];
}
