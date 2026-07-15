import { type CefrLevel } from '@/features/level-system';
import {
  getMissingGrammarTransferEvidence,
  type GrammarRuleProgress,
} from '@/features/grammar';

export type LessonStatus =
  | 'New'
  | 'Practicing'
  | 'Needs Reading/Writing'
  | 'Mastered';

export const MODULE_LABELS: Record<string, string> = {
  'sentence-structure': 'Sentence Basics',
  tense: 'Talking About Time',
  questions: 'Asking Clearly',
  negatives: 'Saying What Is Not True',
  'modal-verbs': 'Permission and Obligation',
  'passive-voice': 'Reporting Work Professionally',
  conditionals: 'Risks and Consequences',
  conjunctions: 'Connecting Ideas',
  'adjectives-adverbs': 'Describing Clearly',
  'sentence-patterns': 'Useful Site Patterns',
  'site-communication-patterns': 'Site Communication',
  articles: 'Nouns and Articles',
  prepositions: 'Place and Direction',
  'relative-clauses': 'Adding Detail',
  nominalization: 'Formal Technical Writing',
  hedging: 'Careful Professional Language',
  'formal-email': 'Professional Email',
  'technical-reporting': 'Technical Reporting',
  'contractual-language': 'Contract Language',
  'risk-language': 'Risk and Consequence',
  'dispute-language': 'Claims and Disputes',
  'executive-summary': 'Executive Summaries',
};

export const STATUS_STYLES: Record<LessonStatus, string> = {
  New: 'border-border-soft bg-surface text-muted-copy',
  Practicing: 'border-primary/25 bg-primary/5 text-primary',
  'Needs Reading/Writing': 'border-warning/30 bg-warning/5 text-warning',
  Mastered: 'border-success/30 bg-success/5 text-success',
};

export const EMPTY_LEVEL_COUNTS: Record<CefrLevel, number> = {
  A1: 0,
  A2: 0,
  B1: 0,
  B2: 0,
  C1: 0,
  C2: 0,
};

export const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ');

const toTitle = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const getModuleLabel = (category: string): string =>
  MODULE_LABELS[category] ?? toTitle(category);

export const getLessonStatus = (
  progress: GrammarRuleProgress
): LessonStatus => {
  if (progress.reviewStatus === 'Strong') return 'Mastered';
  const practiceReady = progress.correctUsages >= 3 && progress.strength >= 70;
  if (practiceReady) return 'Needs Reading/Writing';
  if (
    progress.reviewStatus !== 'New' ||
    progress.exposures > 0 ||
    progress.correctUsages > 0 ||
    progress.incorrectUsages > 0
  ) {
    return 'Practicing';
  }
  return 'New';
};

export const getPracticeCount = (progress: GrammarRuleProgress): number =>
  Math.min(progress.correctUsages, 3);

export const getTransferCount = (progress: GrammarRuleProgress): number =>
  2 - getMissingGrammarTransferEvidence(progress).length;

export const compact = (value: string, fallback: string): string =>
  value.trim() ? value : fallback;

export const getStatusLabel = (
  status: LessonStatus,
  compactLabel = false
): string => {
  if (status === 'Needs Reading/Writing') return compactLabel ? 'R/W' : status;
  return status;
};
