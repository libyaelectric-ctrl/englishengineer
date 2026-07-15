import { MissionDifficulty } from '@/core/learning/learning.types';
import { CefrLevel } from '@/features/level-system';

export type CorrectionType = 'grammar' | 'style' | 'vocabulary';

export interface WritingCorrection {
  id: string;
  type: CorrectionType;
  text: string;
  original: string;
  fix: string;
}

export interface WritingAssessmentRubric {
  clarity: string;
  technicalAccuracy: string;
  grammar: string;
  professionalTone: string;
  conciseness: string;
  completeness: string;
  actionOrientation: string;
  structure?: string;
  technicalVocabulary: string;
}

export interface WritingMission {
  id: string;
  title: string;
  description: string;
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  initialDraft: string;
  corrections: WritingCorrection[];
  xpReward: number;
  coinReward: number;
  eloReward: number;
  scenario?: string;
  task?: string;
  expectedStructure?: string[];
  targetVocabulary?: string[];
  grammarFocus?: string[];
  assessmentRubric?: WritingAssessmentRubric;
  sampleExcellentAnswer?: string;
  sampleWeakAnswer?: string;
  feedbackHints?: string[];
}

export interface WritingSubmission {
  missionId: string;
  finalDraft: string;
  timeSpentMinutes: number;
  autoFixesUsed: number;
}

export interface DetailedCorrectionFeedback {
  correctionId: string;
  type: CorrectionType;
  text: string;
  original: string;
  fix: string;
  isFixed: boolean;
}

export interface WritingEvaluationResult {
  missionId: string;
  linguisticClarityScore: number;
  jargonDensityScore: number;
  professionalToneScore: number;
  finalScore: number;
  xpEarned: number;
  coinsEarned: number;
  eloChange: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  detailedCorrections: DetailedCorrectionFeedback[];
  finalDraft: string;
}

export interface WritingHistoryEntry {
  missionId: string;
  timestamp: string;
  score: number;
  evaluation: WritingEvaluationResult;
}

export interface WritingState {
  completedMissions: Record<string, number>; // missionId -> best score
  lastSelectedMissionId: string | null;
  history: WritingHistoryEntry[];
}

export type WritingSpec = {
  id: string;
  title: string;
  category: string;
  discipline: string;
  cefrLevel: CefrLevel;
  difficulty: MissionDifficulty;
  scenario: string;
  task: string;
  expectedStructure: string[];
  targetVocabulary: string[];
  grammarFocus: string[];
  strongPhrase: string;
  weakPhrase: string;
};
