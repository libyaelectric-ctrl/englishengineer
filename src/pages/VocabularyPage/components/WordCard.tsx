import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { repairVocabularyText, type VocabularyMenuProgress, type VocabularyTerm } from '@/features/vocabulary';
import { WordCardHeader } from './WordCardHeader';
import {
  LearningReview,
  MasteredBadge,
  NewWordHint,
  ReviewReasonBanner,
  QuizForm,
  ReviewActions,
} from './WordCardReview';
import { WordCardDetails } from './WordCardDetails';

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
          <WordCardHeader
            term={term}
            showAnswer={showAnswer}
            status={status}
            progress={progress}
          />

          {status === 'Learning' && progress && (
            <LearningReview
              term={term}
              progress={progress}
              mode={mode}
              onReview={onReview}
            />
          )}

          {status === 'Mastered' && <MasteredBadge />}

          {status === 'New' && <NewWordHint />}

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
            <ReviewReasonBanner term={term} progress={progress} />
          )}

          <WordCardDetails
            term={term}
            showDetails={showDetails}
            onToggle={() => setShowDetails((v) => !v)}
          />

          {mode === 'Quiz' && status === 'New' && (
            <QuizForm
              term={term}
              answer={answer}
              quizResult={quizResult}
              knowThisCheck={knowThisCheck}
              onAnswerChange={setAnswer}
              onSetKnowThisCheck={setKnowThisCheck}
              onSubmit={submitQuiz}
              onLearn={onLearn}
            />
          )}

          {mode === 'Review' && status !== 'Mastered' && (
            <ReviewActions term={term} onReview={onReview} />
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
