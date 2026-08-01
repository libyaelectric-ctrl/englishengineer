export interface MockExample {
  input: string;
  output: string;
}

export type AICoachModeId =
  | 'site_report_writer'
  | 'consultant_reply_assistant'
  | 'technical_email_assistant'
  | 'ncr_response_assistant'
  | 'delay_explanation_assistant'
  | 'meeting_preparation_coach'
  | 'vocabulary_explainer'
  | 'grammar_explainer'
  | 'roleplay_simulator'
  | 'daily_learning_planner'
  | 'career_mentor'
  | 'writing_reviewer'
  | 'document_analysis_assistant'
  | 'linkedin_optimizer'
  | 'custom_scenario_generator'
  | 'project_copilot_agent'
  | 'cv_optimizer';

export type AIProviderMode = 'mock' | 'backend' | 'backend-proxy';
export type AIProviderState = 'mock-fallback' | 'backend-configured' | 'backend-error';

export interface AIProviderStatus {
  mode: AIProviderMode;
  state: AIProviderState;
  label: string;
  detail: string;
  isConnected: boolean;
}

export interface AICoachResult {
  summary: string;
  professionalVersion?: string;
  simplifiedVersion?: string;
  strengths: string[];
  weaknesses: string[];
  corrections: string[];
  nativeRewrite: string;
  technicalVocabulary: string[];
  keyVocabulary?: string[];
  grammarNotes?: string[];
  toneFeedback?: string;
  recommendedNextTask: string;
  estimatedCefrImpact: string;
  cefrEstimate?: string;
  engineerEloImpactEstimate?: string;
  suggestedActions: string[];
  focusArea: string;
}

export interface AICoachSession {
  id: string;
  modeId: AICoachModeId;
  modeName: string;
  input: string;
  result: AICoachResult;
  timestamp: string;
  providerUsed: AIProviderStatus;
}
