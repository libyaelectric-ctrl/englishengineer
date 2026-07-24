import { FormEvent, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import {
  repairVocabularyText,
  type VocabularyMenuProgress,
  type VocabularyTerm,
} from '@/features/vocabulary';
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

const StatusContent = ({
  status,
  progress,
  term,
  mode,
  onReview,
  showAnswer,
  onLearn,
}: {
  status: string;
  progress?: VocabularyMenuProgress;
  term: VocabularyTerm;
  mode: VocabularySetMode;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  showAnswer: boolean;
  onLearn?: (term: VocabularyTerm) => void;
}) => {
  const isLearned = status === 'learned';
  const isQuizMode = mode === 'Quiz';

  return (
    <>
      {isLearned && isQuizMode && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Added to Learned List
        </div>
      )}
      {isLearned && !isQuizMode && progress && (
        <LearningReview
          term={term}
          progress={progress}
          mode={mode}
          onReview={onReview}
        />
      )}
      {status === 'mastered' && <MasteredBadge />}
      {status === 'new' && (
        <>
          <NewWordHint />
          <button
            type="button"
            onClick={() => onLearn?.(term)}
            className="mt-2 w-full rounded-[4px] bg-[#0047bb] px-3 py-2 text-xs font-bold text-white hover:bg-[#0047bb]/90 transition-colors cursor-pointer"
          >
            I Know This
          </button>
        </>
      )}
      {showAnswer && (
        <div className="mt-4 flex-1 space-y-2 text-sm leading-6 text-muted-copy">
          <p>{repairVocabularyText(term.exampleSentence)}</p>
          <p className="text-foreground0">
            {repairVocabularyText(term.turkishExample)}
          </p>
        </div>
      )}
    </>
  );
};

const DomainBar = ({ status }: { status: string }) => (
  <div className="mt-4 border-t border-border-soft pt-3 text-xs text-foreground0">
    <span>{status}</span>
  </div>
);

const CardActions = ({
  mode,
  status,
  progress,
  term,
  onReview,
  answer,
  quizResult,
  knowThisCheck,
  setAnswer,
  setKnowThisCheck,
  submitQuiz,
  onLearn,
  showDetails,
  setShowDetails,
}: {
  mode: VocabularySetMode;
  status: string;
  progress?: VocabularyMenuProgress;
  term: VocabularyTerm;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  answer: string;
  quizResult: boolean | null;
  knowThisCheck: boolean;
  setAnswer: (v: string) => void;
  setKnowThisCheck: (v: boolean) => void;
  submitQuiz: (e: FormEvent) => void;
  onLearn?: (term: VocabularyTerm) => void;
  showDetails: boolean;
  setShowDetails: (fn: (v: boolean) => boolean) => void;
}) => (
  <>
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
  </>
);

const checkQuizAnswer = (answer: string, turkishMeaning: string): boolean => {
  const expected = normalizeAnswer(turkishMeaning);
  const response = normalizeAnswer(answer);
  const alternatives = expected.split('/').map((item) => item.trim());
  return alternatives.some(
    (item) => response === item || expected === response
  );
};

const getBorderClass = (isWeak?: boolean): string =>
  isWeak
    ? 'border border-rose-400/50'
    : 'border border-[#0047bb]/25 hover:border-[#0047bb]/50';

import { playSound } from '@/shared/utils/sound';

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
  const status = progress?.status ?? 'new';
  const showAnswer = mode !== 'Quiz' || quizResult !== null;

  const handleLearnClick = (t: VocabularyTerm) => {
    playSound('ding');
    onLearn?.(t);
  };

  const submitQuiz = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim() || quizResult !== null) return;
    const correct = checkQuizAnswer(answer, term.turkishMeaning);
    setQuizResult(correct);
    if (correct) {
      playSound('success');
    } else {
      playSound('error');
    }
    onReview(term, correct);
  };

  const handleToggleDetails = (fn: (v: boolean) => boolean) => {
    playSound('flip');
    setShowDetails(fn);
  };

  return (
    <article
      data-testid="vocabulary-word-card"
      className={`flex h-full flex-col rounded-[4px] bg-surface/60 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative ${getBorderClass(progress?.isWeak)}`}
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
          <StatusContent
            status={status}
            progress={progress}
            term={term}
            mode={mode}
            onReview={onReview}
            showAnswer={showAnswer}
            onLearn={onLearn}
          />
          <DomainBar status={status} />
          <CardActions
            mode={mode}
            status={status}
            progress={progress}
            term={term}
            onReview={onReview}
            answer={answer}
            quizResult={quizResult}
            knowThisCheck={knowThisCheck}
            setAnswer={setAnswer}
            setKnowThisCheck={setKnowThisCheck}
            submitQuiz={submitQuiz}
            onLearn={handleLearnClick}
            showDetails={showDetails}
            setShowDetails={handleToggleDetails}
          />
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
