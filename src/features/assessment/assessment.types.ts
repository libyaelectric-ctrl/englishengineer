import { MissionModule, ScoreResult } from '@/core/learning/learning.types';

export type AssessmentDimensionId =
  | 'grammar_accuracy'
  | 'vocabulary_range'
  | 'technical_vocabulary'
  | 'professional_tone'
  | 'clarity'
  | 'conciseness'
  | 'meeting_readiness'
  | 'site_communication'
  | 'qa_qc_communication'
  | 'commissioning_communication'
  | 'consultant_communication'
  | 'report_writing'
  | 'email_writing'
  | 'listening_comprehension'
  | 'speaking_confidence'
  | 'engineering_cefr'
  | 'engineer_elo';

export interface AssessmentDimension {
  id: AssessmentDimensionId;
  label: string;
  description: string;
}

export interface AssessmentDimensionScore {
  dimensionId: AssessmentDimensionId;
  label: string;
  score: number | null;
  evidence: string;
}

export interface AssessmentResult {
  activityModule: MissionModule | 'AI Copilot';
  overallScore: number | null;
  cefrEstimate: string | null;
  engineerEloEstimate: number | null;
  dimensionScores: AssessmentDimensionScore[];
  strengths: string[];
  weaknesses: string[];
  priorityImprovementAreas: string[];
  nextRecommendedPractice: string;
  professionalFeedback: string;
  simplifiedFeedback: string;
  technicalVocabularyFeedback: string;
  dataStatus: 'sufficient' | 'limited' | 'insufficient';
  trustLabel: string;
  confidenceScore: number;
  confidenceExplanation: string;
  certificateDisclaimer: string;
}

export interface AssessmentReadiness {
  meetings: number | null;
  reports: number | null;
  consultantCommunication: number | null;
}

export interface AssessmentProfile {
  hasEnoughData: boolean;
  dataStatus: 'sufficient' | 'limited' | 'insufficient';
  overallScore: number | null;
  engineerCefr: string | null;
  engineerElo: number;
  dimensionScores: AssessmentDimensionScore[];
  strongestDimensions: AssessmentDimensionScore[];
  weakestDimensions: AssessmentDimensionScore[];
  recentHistory: AssessmentResult[];
  recommendedNextMissions: string[];
  readiness: AssessmentReadiness;
  trustLabel: string;
  confidenceScore: number;
  confidenceExplanation: string;
  certificateDisclaimer: string;
}

export interface AssessmentSourceScore {
  module: MissionModule;
  score: number;
  durationMinutes: number;
}

export interface AssessmentWrappedScore {
  baseScore: ScoreResult;
  assessment: AssessmentResult;
}
