import { MissionDifficulty } from '@/core/learning/learning.types';
import { CefrLevel } from '@/features/level-system';

export interface SpeakingTargetTerm {
  word: string;
  IPA: string;
  score: number;
}

export interface SpeakingMission {
  id: string;
  title: string;
  description: string;
  scenarioType:
    | 'site_meeting'
    | 'toolbox_talk'
    | 'consultant_discussion'
    | 'client_presentation'
    | 'progress_meeting'
    | 'commissioning_meeting'
    | 'fat_meeting'
    | 'technical_explanation'
    | 'safety_briefing'
    | 'design_coordination';
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  promptText: string;
  expectedKeywords: string[];
  grammarTargets: string[];
  confidenceMarkers: string[];
  syllabicTargets: SpeakingTargetTerm[];
  targetWpm: number;
  xpReward: number;
  coinReward: number;
  eloReward: number;
}

export interface SpeakingSubmission {
  missionId: string;
  transcript: string;
  typedTranscript: string;
  timeSpentMinutes: number;
  recordingSeconds: number;
  usedSpeechRecognition: boolean;
}

export type SpeakingRoleplayCategory = 'Daily' | 'Work' | 'Engineering';

export interface SpeakingEvaluationResult {
  missionId: string;
  fluencyScore: number;
  clarityScore: number;
  grammarScore: number;
  technicalVocabularyScore: number;
  confidenceScore: number;
  finalScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  wordCount: number;
  sentenceCount: number;
  fillerWordCount: number;
  wordsPerMinute: number;
  isWordsPerMinuteEstimated: boolean;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  transcriptUsed: string;
}

export interface SpeakingHistoryEntry {
  missionId: string;
  timestamp: string;
  score: number;
  evaluation: SpeakingEvaluationResult;
  roleplayMode?: 'Written Roleplay';
  errorType?: 'Speaking Response' | 'Vocabulary' | 'Grammar' | null;
  progressNote?: string;
}

export interface SpeakingState {
  completedMissions: Record<string, number>;
  lastSelectedMissionId: string | null;
  history: SpeakingHistoryEntry[];
}
