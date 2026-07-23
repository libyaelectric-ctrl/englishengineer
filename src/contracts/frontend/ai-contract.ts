/**
 * Frontend contract for AI Coach API responses.
 */

export type AIOperation =
  | 'analyzeProgress'
  | 'evaluateEngineeringEnglish'
  | 'analyzeText'
  | 'generatePractice';

export interface AICoachRequest {
  prompt: string;
  operation?: AIOperation;
  modeId?: string;
}

export interface AICoachResponse {
  result: string;
  focusArea: string;
  suggestions: string[];
  cached: boolean;
}

export const isAICoachResponse = (data: unknown): data is AICoachResponse =>
  typeof data === 'object' &&
  data !== null &&
  'result' in data &&
  'focusArea' in data;
