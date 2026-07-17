import { FormEvent } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getVocabularyReviewReason, type VocabularyMenuProgress, type VocabularyTerm } from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';
import type { VocabularySetMode } from './WordCard';

interface LearningReviewProps {
  term: VocabularyTerm;
  progress: VocabularyMenuProgress;
  mode: VocabularySetMode;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
}

export const LearningReview = ({ term, progress, mode, onReview }: LearningReviewProps) => (
  <div className="mt-3 space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-sm tracking-widest text-primary">
        {'●'.repeat(Math.min(progress.correctReviews, 5))}
        {'○'.repeat(Math.max(0, 5 - Math.min(progress.correctReviews, 5)))}
      </span>
      <span className="text-xs font-semibold text-muted-copy">
        {progress.correctReviews} correct → Mastered
      </span>
    </div>
    {mode !== 'Review' && (
      <div className="grid grid-cols-2 gap-2">
        <Button variant="success" className="px-3" onClick={() => onReview(term, true)}>
          <CheckCircle2 className="h-4 w-4" /> Remembered
        </Button>
        <Button variant="danger" className="px-3" onClick={() => onReview(term, false)}>
          <XCircle className="h-4 w-4" /> Review again
        </Button>
      </div>
    )}
  </div>
);

export const MasteredBadge = () => (
  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
    <span>🏆</span>
    Reading & Writing havuzuna eklendi
  </div>
);

export const NewWordHint = () => (
  <p className="mt-3 text-xs font-semibold text-muted-copy">
    1 correct answer → moves to Learning
  </p>
);

export const ReviewReasonBanner = ({
  term: _term,
  progress,
}: {
  term: VocabularyTerm;
  progress: VocabularyMenuProgress;
}) => (
  <div className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
    <span className="font-black">Why review now: </span>
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
  knowThisCheck,
  onAnswerChange,
  onSetKnowThisCheck,
  onSubmit,
  onLearn,
}: QuizFormProps) => (
  <form onSubmit={onSubmit} className="mt-4 space-y-2">
    <Button type="button" className="w-full" onClick={() => onLearn?.(term)}>
      <CheckCircle2 className="h-4 w-4" /> Learn this word
    </Button>
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => onSetKnowThisCheck(true)}
    >
      I Know This — Take Mini Quiz
    </Button>
    <p
      style={{ display: knowThisCheck ? undefined : 'none' }}
      className="text-xs font-semibold text-primary"
    >
      Use the mini quiz if you want to check recall before saving.
    </p>
    <label className="text-xs font-bold text-foreground">
      Turkish meaning
      <input
        value={answer}
        disabled={quizResult !== null}
        onChange={(event) => onAnswerChange(event.target.value)}
        className="mt-1 min-h-10 w-full rounded-lg border border-border-soft px-3 font-normal"
      />
    </label>
    <Button type="submit" className="w-full" disabled={!answer.trim()}>
      Check answer
    </Button>
    {quizResult !== null && (
      <p
        className={`text-sm font-bold ${quizResult ? 'text-emerald-700' : 'text-rose-700'}`}
      >
        {quizResult ? 'Correct review recorded.' : 'Added to Weak Words.'}
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
      className="px-3"
      aria-label={`Mark ${term.term} remembered`}
      onClick={() => onReview(term, true)}
    >
      <CheckCircle2 className="h-4 w-4" /> Remembered
    </Button>
    <Button
      variant="danger"
      className="px-3"
      aria-label={`Review ${term.term} again`}
      onClick={() => onReview(term, false)}
    >
      <XCircle className="h-4 w-4" /> Review again
    </Button>
  </div>
);
