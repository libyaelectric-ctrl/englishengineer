export type CareerRole =
  | 'Electrical Works Chief'
  | 'MEP Coordinator'
  | 'QA/QC Engineer'
  | 'Commissioning Engineer'
  | 'Site Engineer'
  | 'Procurement Engineer'
  | 'HSE Engineer'
  | 'Data Center Engineer'
  | 'Project Manager';

export type DailyTaskModule =
  | 'Reading'
  | 'Writing'
  | 'Listening'
  | 'Speaking'
  | 'Vocabulary'
  | 'Quick AI';

export type CoreMistakeType =
  | 'Vocabulary'
  | 'Grammar'
  | 'Listening'
  | 'Writing Structure'
  | 'Speaking Response'
  | 'CEFR Mismatch';

export type MistakeCategory =
  | CoreMistakeType
  | 'grammar'
  | 'word choice'
  | 'tone'
  | 'unclear sentence'
  | 'Turkish thinking pattern'
  | 'missing article'
  | 'wrong preposition'
  | 'weak technical explanation'
  | 'repeated vocabulary gap'
  | 'clarity'
  | 'preposition'
  | 'article'
  | 'repeated phrase issue';

export interface DailyCommunicationTask {
  id: string;
  module: DailyTaskModule;
  title: string;
  description: string;
  route: string;
  estimatedMinutes: number;
  level: import('@/features/level-system').CefrLevel;
}

export interface MistakeLogEntry {
  id: string;
  category: MistakeCategory;
  originalText: string;
  correction: string;
  createdAt: string;
  updatedAt?: string;
  repetitionCount?: number;
  isCritical?: boolean;
}

export type ReviewPrioritySource =
  | 'weak-word'
  | 'due-item'
  | 'repeated-mistake'
  | 'skill-weakness';

export interface ReviewPriorityCandidate {
  id: string;
  label: string;
  source: ReviewPrioritySource;
  severity?: number;
}

export interface ReviewPriorityItem extends ReviewPriorityCandidate {
  priority: number;
  reason: string;
}

export interface UnifiedReviewItem extends ReviewPriorityItem {
  route: string;
  detail: string;
}

export interface LearningIntelligencePreferences {
  careerRole: CareerRole;
  completedTaskDates: Record<string, string>;
  mistakeLog: MistakeLogEntry[];
  lastReportDate: string | null;
}

export interface SevenDayProgressReport {
  completedTasks: number;
  improvedSkill: string;
  weakArea: string;
  repeatedMistakes: string[];
  nextWeekFocus: string;
  eloEstimate: number;
  cefrEstimate: string;
  recommendedNextTasks: string[];
  currentLevel: import('@/features/level-system').CefrLevel;
  topRepeatedMistake: string;
  recommendedWorkTools: string;
  recommendedQuickAIAction: string;
  recommendedPhraseCategory: string;
}
