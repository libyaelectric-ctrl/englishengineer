export type AIProviderMode = 'mock' | 'backend' | 'backend-proxy';
export type AIProviderState =
  | 'mock-fallback'
  | 'backend-configured'
  | 'backend-error';
export type AIContractVersion = '2026-06-26.v1';
export type AIOperation =
  | 'analyzeText'
  | 'rewriteText'
  | 'generatePractice'
  | 'evaluateEngineeringEnglish'
  | 'generateStudyPlan'
  | 'analyzeProgress';

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

export interface AIProviderStatus {
  mode: AIProviderMode;
  state: AIProviderState;
  label: string;
  detail: string;
  isConnected: boolean;
}

export interface MistakeLogEntry {
  originalText: string;
  correction: string;
  category: string;
}

export interface AICoachContext {
  userName: string;
  role: string;
  discipline: string;
  targetLevel: string;
  xp: number;
  level: number;
  elo: number;
  streak: number;
  averageScore: number;
  completedMissions: number;
  totalMissions: number;
  weakSkills: string[];
  strongSkills: string[];
  recentActivities: string[];
  weakVocabulary: string[];
  wordsLearned: number;
  vocabularyRetention: number;
  recommendedFocus: string;
  recentMistakes?: { originalText: string; correction: string; category: string }[];
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

export interface AICoachMode {
  id: AICoachModeId;
  name: string;
  description: string;
  operation: AIOperation;
  placeholder: string;
  templateIds?: string[];
}

export interface AIPromptTemplate {
  id: string;
  title: string;
  description: string;
  modeId: AICoachModeId;
  prompt: string;
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

export interface AIRequest {
  operation: AIOperation;
  modeId: string;
  modeName: string;
  prompt: string;
  context?: AICoachContext;
}

export interface AIRequestMetadata {
  contractVersion: AIContractVersion;
  requestId: string;
  sentAt: string;
  client: 'EngVox-web';
}

export interface AIResponseMetadata {
  contractVersion: AIContractVersion;
  requestId: string;
  operation: AIOperation;
  durationMs: number;
  success: boolean;
  retryCount: number;
  errorCode?: string;
}

export interface AIResponse {
  text: string;
  providerStatus: AIProviderStatus;
  structuredResult?: AICoachResult;
  metadata?: AIResponseMetadata;
}

export interface AISessionLog {
  id: string;
  provider: AIProviderMode;
  operation: AIOperation;
  durationMs: number;
  success: boolean;
  timestamp: string;
  errorMessage?: string;
  requestId?: string;
}

export interface AIProvider {
  getStatus: () => AIProviderStatus;
  analyzeText: (request: AIRequest) => Promise<AIResponse>;
  rewriteText: (request: AIRequest) => Promise<AIResponse>;
  generatePractice: (request: AIRequest) => Promise<AIResponse>;
  evaluateEngineeringEnglish: (request: AIRequest) => Promise<AIResponse>;
  generateStudyPlan: (request: AIRequest) => Promise<AIResponse>;
  analyzeProgress: (request: AIRequest) => Promise<AIResponse>;
}
