import { FormEvent } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  getVocabularyReviewReason,
  type VocabularyMenuProgress,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';
import type { VocabularySetMode } from './WordCard';

interface LearningReviewProps {
  term: VocabularyTerm;
  progress: VocabularyMenuProgress;
  mode: VocabularySetMode;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
}

export const LearningReview = ({
  term: _term,
  progress: _progress,
  mode: _mode,
  onReview: _onReview,
}: LearningReviewProps) => (
  <div className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-blue-200 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 text-xs font-bold text-[#0047bb]">
    <CheckCircle2 className="h-4 w-4" /> Learned (In Master Quiz Pool)
  </div>
);

export const MasteredBadge = () => (
  <div className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
    <span>🏆</span>
    Mastered (Added to Skill Pool)
  </div>
);

export const NewWordHint = () => (
  <p className="mt-3 text-xs font-semibold text-muted-copy">
    Click 'I Know This' or test meaning to move to Learned
  </p>
);

export const ReviewReasonBanner = ({
  term: _term,
  progress,
}: {
  term: VocabularyTerm;
  progress: VocabularyMenuProgress;
}) => (
  <div className="mt-3 rounded-[4px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
    <span className="font-black">Review Reason: </span>
    {getVocabularyReviewReason(progress)}
  </div>
);

interface QuizFormProps {
  term: VocabularyTerm;
  answer: string;
  quizResult: boolean | null;
  knowThisCheck: boolean;
  onAnswerChange: (value: string) => void;
  onSetKnowThisCheck: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  onLearn?: (term: VocabularyTerm) => void;
}

export const QuizForm = ({
  term,
  answer,
  quizResult,
  knowThisCheck: _knowThisCheck,
  onAnswerChange,
  onSetKnowThisCheck: _onSetKnowThisCheck,
  onSubmit,
  onLearn,
}: QuizFormProps) => (
  <form onSubmit={onSubmit} className="mt-4 space-y-2">
    <Button
      type="button"
      className="w-full rounded-[4px] bg-[#0047bb] hover:bg-[#0047bb]/90 text-white font-bold"
      onClick={() => onLearn?.(term)}
    >
      <CheckCircle2 className="h-4 w-4 mr-1.5" /> I Know This
    </Button>
    <div className="relative pt-1 text-center">
      <span className="text-[10px] text-muted-copy uppercase tracking-wider font-semibold">
        or Test Meaning
      </span>
    </div>
    <label className="block text-xs font-bold text-foreground">
      Turkish meaning
      <input
        value={answer}
        disabled={quizResult !== null}
        onChange={(event) => onAnswerChange(event.target.value)}
        className="mt-1 min-h-10 w-full rounded-[4px] border border-border-soft px-3 font-normal bg-surface outline-none focus:border-[#0047bb]"
        placeholder="Type Turkish meaning..."
      />
    </label>
    <Button
      type="submit"
      variant="outline"
      className="w-full rounded-[4px]"
      disabled={!answer.trim()}
    >
      Check Answer
    </Button>
    {quizResult !== null && (
      <p
        className={`text-xs font-bold mt-1 ${quizResult ? 'text-emerald-600' : 'text-rose-600'}`}
      >
        {quizResult
          ? 'Correct — Moved to Learned pool.'
          : 'Incorrect — Added to Weak Words.'}
      </p>
    )}
  </form>
);

interface ReviewActionsProps {
  term: VocabularyTerm;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
}

export const ReviewActions = ({ term, onReview }: ReviewActionsProps) => (
  <div className="mt-4 grid grid-cols-2 gap-2">
    <Button
      variant="success"
      className="px-3 rounded-[4px]"
      aria-label={`Mark ${term.term} remembered`}
      onClick={() => onReview(term, true)}
    >
      <CheckCircle2 className="h-4 w-4" /> Remembered
    </Button>
    <Button
      variant="danger"
      className="px-3 rounded-[4px]"
      aria-label={`Review ${term.term} again`}
      onClick={() => onReview(term, false)}
    >
      <XCircle className="h-4 w-4" /> Review Again
    </Button>
  </div>
);
