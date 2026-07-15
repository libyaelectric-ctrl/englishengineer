import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react';
import {
  getVocabularyReviewReason,
  repairVocabularyText,
  type VocabularyMenuProgress,
  type VocabularyTerm,
} from '@/features/vocabulary';
import { Button } from '@/shared/components/Button';

export type VocabularySetMode = 'Quiz' | 'Review' | 'View';

const normalizeAnswer = (value: string): string =>
  repairVocabularyText(value)
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

interface WordCardProps {
  term: VocabularyTerm;
  progress?: VocabularyMenuProgress;
  mode: VocabularySetMode;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onLearn?: (term: VocabularyTerm) => void;
}

export const WordCard = ({
  term,
  progress,
  mode,
  onReview,
  onLearn,
}: WordCardProps) => {
  const [answer, setAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [knowThisCheck, setKnowThisCheck] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const status = progress?.status ?? 'New';
  const showAnswer = mode !== 'Quiz' || quizResult !== null;

  const submitQuiz = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim() || quizResult !== null) return;
    const expected = normalizeAnswer(term.turkishMeaning);
    const response = normalizeAnswer(answer);
    const correct = expected
      .split('/')
      .map((item) => item.trim())
      .some((item) => response === item || expected === response);
    setQuizResult(correct);
    onReview(term, correct);
  };

  return (
    <article
      data-testid="vocabulary-word-card"
      className={`flex h-full flex-col rounded-xl border bg-surface p-5 shadow-sm relative ${
        progress?.isWeak
          ? 'border-rose-300 bg-rose-50/30'
          : 'border-border-soft'
      }`}
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFlipped ? 'back' : 'front'}
          initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-foreground">
                {repairVocabularyText(term.term)}
              </h3>
              {showAnswer && (
                <p className="mt-1 font-semibold text-primary">
                  {repairVocabularyText(term.turkishMeaning)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-bold text-primary">
                {term.cefrLevel}
              </span>
              <span className="rounded-full border border-border-soft bg-surface-hover px-2 py-1 text-[10px] font-bold text-muted-copy">
                {status}
              </span>
              {progress?.isWeak && (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
                  Weak
                </span>
              )}
              {progress?.isForgotten && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                  Forgotten
                </span>
              )}
            </div>
          </div>

          {status === 'Learning' && progress && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-widest text-primary">
                  {'●'.repeat(Math.min(progress.correctReviews, 5))}
                  {'○'.repeat(
                    Math.max(0, 5 - Math.min(progress.correctReviews, 5))
                  )}
                </span>
                <span className="text-xs font-semibold text-muted-copy">
                  {progress.correctReviews} correct → Mastered
                </span>
              </div>
              {mode !== 'Review' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="success"
                    className="px-3"
                    onClick={() => onReview(term, true)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Remembered
                  </Button>
                  <Button
                    variant="danger"
                    className="px-3"
                    onClick={() => onReview(term, false)}
                  >
                    <XCircle className="h-4 w-4" /> Review again
                  </Button>
                </div>
              )}
            </div>
          )}

          {status === 'Mastered' && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span>🏆</span>
              Reading & Writing havuzuna eklendi
            </div>
          )}

          {status === 'New' && (
            <p className="mt-3 text-xs font-semibold text-muted-copy">
              1 correct answer → moves to Learning
            </p>
          )}

          {showAnswer && (
            <div className="mt-4 flex-1 space-y-2 text-sm leading-6 text-muted-copy">
              <p>{repairVocabularyText(term.exampleSentence)}</p>
              <p className="text-foreground0">
                {repairVocabularyText(term.turkishExample)}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-soft pt-3 text-xs text-foreground0">
            <span className="font-semibold capitalize">
              Domain: {repairVocabularyText(term.domain).replace(/-/g, ' ')}
            </span>
            <span>{status === 'New' ? 'Ready to learn' : status}</span>
          </div>

          {mode === 'Review' && progress && (
            <div className="mt-3 rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
              <span className="font-black">Why review now: </span>
              {getVocabularyReviewReason(progress)}
            </div>
          )}

          <div className="mt-3 rounded-lg border border-border-soft bg-surface-hover p-3 text-xs text-muted-copy">
            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              aria-expanded={showDetails}
              className="flex w-full items-center justify-between font-bold text-foreground"
            >
              Word details
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              />
            </button>
            {showDetails && (
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="font-bold">Part of speech</dt>
                  <dd>{term.partOfSpeech}</dd>
                </div>
                <div>
                  <dt className="font-bold">Content domain</dt>
                  <dd>{term.contentDomain}</dd>
                </div>
                <div>
                  <dt className="font-bold">Life context</dt>
                  <dd>{term.lifeContext}</dd>
                </div>
                <div>
                  <dt className="font-bold">Register</dt>
                  <dd>{term.register}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold">Primary use case</dt>
                  <dd>{term.primaryUseCase}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold">Grammar fits</dt>
                  <dd>{term.grammarFits.join(', ') || 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold">Skill use</dt>
                  <dd>{term.skillUse.join(', ')}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold">Common mistakes</dt>
                  <dd>{repairVocabularyText(term.commonMistakes)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold">Related terms</dt>
                  <dd>{term.relatedTerms.join(', ') || 'Not specified'}</dd>
                </div>
              </dl>
            )}
          </div>

          {mode === 'Quiz' && status === 'New' && (
            <form onSubmit={submitQuiz} className="mt-4 space-y-2">
              <Button
                type="button"
                className="w-full"
                onClick={() => onLearn?.(term)}
              >
                <CheckCircle2 className="h-4 w-4" /> Learn this word
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setKnowThisCheck(true)}
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
                  onChange={(event) => setAnswer(event.target.value)}
                  className="mt-1 min-h-10 w-full rounded-lg border border-border-soft px-3 font-normal"
                />
              </label>
              <Button
                type="submit"
                className="w-full"
                disabled={!answer.trim()}
              >
                Check answer
              </Button>
              {quizResult !== null && (
                <p
                  className={`text-sm font-bold ${quizResult ? 'text-emerald-700' : 'text-rose-700'}`}
                >
                  {quizResult
                    ? 'Correct review recorded.'
                    : 'Added to Weak Words.'}
                </p>
              )}
            </form>
          )}

          {mode === 'Review' && status !== 'Mastered' && (
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
          )}
        </motion.div>
      </AnimatePresence>
      {mode !== 'Quiz' && (
        <button
          type="button"
          onClick={() => setIsFlipped((f) => !f)}
          className="absolute top-3 right-3 text-[10px] font-bold text-primary hover:text-primary-hover transition-colors"
        >
          {isFlipped ? 'Front' : 'Flip'}
        </button>
      )}
    </article>
  );
};
