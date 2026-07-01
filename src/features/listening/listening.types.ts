import { MissionDifficulty } from '@/core/learning/learning.types';
import { CefrLevel } from '@/features/level-system';

export type ListeningQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'technical_fill_in';
export type ListeningMissionType =
  | 'Office Meeting'
  | 'Site Meeting'
  | 'Consultant Meeting'
  | 'Toolbox Talk'
  | 'Inspection'
  | 'Commissioning'
  | 'Generator Test'
  | 'FAT'
  | 'Fire Alarm Test'
  | 'Daily Coordination';

export type ListeningPlaybackSpeed = 0.75 | 1 | 1.25 | 1.5;

export interface ListeningQuestion {
  id: string;
  type: ListeningQuestionType;
  questionText: string;
  choices?: string[]; // For multiple choice
  correctAnswer: string; // Choice letter or text
  explanation: string;
}

export interface ListeningVocabularyItem {
  term: string;
  definition: string;
  context: string;
}

export interface ListeningMission {
  id: string;
  title: string;
  description: string;
  missionType: ListeningMissionType;
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  audioUrl: string;
  fallbackAudioUrl?: string;
  audioDurationSeconds: number;
  accentLabel: string;
  audioSourceLabel: string;
  transcript: string;
  hiddenTranscript: string; // Cloze / bracketed / masked version or summarized layout
  keywords: string[];
  vocabulary: ListeningVocabularyItem[];
  questions: ListeningQuestion[];
  xpReward: number;
  coinReward: number;
  eloReward: number;
}

export interface ListeningSubmission {
  missionId: string;
  answers: Record<string, string>; // questionId -> userAnswer
  summary: string;
  userKeywords: string; // User-identified keywords
  timeSpentMinutes: number;
}

export interface ListeningDetailedAnswerFeedback {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ListeningEvaluationResult {
  missionId: string;
  comprehensionScore: number; // based on questions
  keywordScore: number; // based on userKeywords matched with keywords
  vocabularyScore: number; // based on technical terms found in summary
  summaryScore: number; // based on structural quality & length
  finalScore: number; // weighted average
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  detailedAnswers: ListeningDetailedAnswerFeedback[];
  summaryFeedback: string;
  keywordFeedback: string;
}

export interface ListeningHistoryEntry {
  missionId: string;
  timestamp: string;
  score: number;
  evaluation: ListeningEvaluationResult;
}

export interface ListeningState {
  completedMissions: Record<string, number>; // missionId -> best score
  lastSelectedMissionId: string | null;
  history: ListeningHistoryEntry[];
  favoriteMissionIds: string[];
  resumePositions: Record<string, number>;
  replayCounts: Record<string, number>;
  listeningSecondsByMission: Record<string, number>;
  speedSamples: ListeningPlaybackSpeed[];
  audioCompletedMissionIds: string[];
}
