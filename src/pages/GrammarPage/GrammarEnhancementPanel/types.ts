import { type GrammarRule, type GrammarRuleProgress } from '@/features/grammar';
import { getLessonStatus } from '../GrammarPageHelpers';

export type RuleWithProgress = {
  rule: GrammarRule;
  progress: GrammarRuleProgress;
  status: ReturnType<typeof getLessonStatus>;
  isUnlocked: boolean;
};

export type ProofIssue = {
  label: string;
  before: string;
  after: string;
  reason: string;
};
