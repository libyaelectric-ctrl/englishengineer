export type WorkToolKind = 'engineering-template' | 'email-template' | 'phrase';

export interface EngineeringTemplate {
  id: string;
  title: string;
  context: string;
  sampleInput: string;
  professionalOutput: string;
  turkishExplanation: string;
  category: string;
  useCase: string;
  tone: string;
  tags: string[];
}

export interface EmailTemplate {
  id: string;
  title: string;
  shortVersion: string;
  professionalVersion: string;
  politeVersion: string;
  technicalVersion: string;
  turkishExplanation: string;
  category: string;
  subject: string;
  tags: string[];
}

export interface PhraseEntry {
  id: string;
  category: string;
  phrase: string;
  turkishMeaning: string;
  usageContext: string;
  example: string;
  tone: string;
  tags: string[];
}

export interface QuickAIDraft {
  sourceId: string;
  sourceKind: WorkToolKind;
  title: string;
  text: string;
}

export interface WorkToolsPreferences {
  favoritePhraseIds: string[];
  recentItemIds: string[];
  recentSearches: string[];
  quickAIDraft: QuickAIDraft | null;
}
