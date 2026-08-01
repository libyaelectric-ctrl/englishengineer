import { CheckCircle2, RotateCw, Volume2 } from 'lucide-react';

import { FormEvent, useEffect, useState } from 'react';

import { playSound } from '@/shared/utils/sound';

import {
  PronunciationService,
  type VocabularyMenuProgress,
  type VocabularyTerm,
  repairVocabularyText,
} from '@/features/vocabulary';

import { WordCardDetails } from './WordCardDetails';
import { WordCardHeader } from './WordCardHeader';
import {
  LearningReview,
  MasteredBadge,
  NewWordHint,
  QuizForm,
  ReviewActions,
  ReviewReasonBanner,
} from './WordCardReview';

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

const checkQuizAnswer = (answer: string, turkishMeaning: string): boolean => {
  const expected = normalizeAnswer(turkishMeaning);
  const response = normalizeAnswer(answer);
  const alternatives = expected.split('/').map((item) => item.trim());
  return alternatives.some((item) => response === item || expected === response);
};

const getBorderClass = (isWeak?: boolean): string =>
  isWeak ? 'border border-rose-400/50' : 'border border-primary/25 hover:border-primary/50';

interface WordCardFrontProps {
  term: VocabularyTerm;
  progress?: VocabularyMenuProgress;
  mode: VocabularySetMode;
  status: string;
  showAnswer: boolean;
  answer: string;
  quizResult: boolean | null;
  knowThisCheck: boolean;
  showDetails: boolean;
  onAnswerChange: (v: string) => void;
  onSetKnowThisCheck: (v: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onLearn?: (term: VocabularyTerm) => void;
  onReview: (term: VocabularyTerm, isCorrect: boolean) => void;
  onToggleDetails: (fn: (v: boolean) => boolean) => void;
  onToggleFlip: () => void;
}

const WordCardFront: React.FC<WordCardFrontProps> = ({
  term,
  progress,
  mode,
  status,
  showAnswer,
  answer,
  quizResult,
  knowThisCheck,
  showDetails,
  onAnswerChange,
  onSetKnowThisCheck,
  onSubmit,
  onLearn,
  onReview,
  onToggleDetails,
  onToggleFlip,
}) => (
  <div
    className={`absolute inset-0 flex min-h-0 flex-col justify-between overflow-hidden rounded-xl bg-surface/90 p-5 border border-primary/20 backdrop-blur-md ${getBorderClass(progress?.isWeak)}`}
    style={{ backfaceVisibility: 'hidden' }}
  >
    <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
      <WordCardHeader term={term} showAnswer={showAnswer} status={status} progress={progress} />
      {mode === 'Review' && progress && <ReviewReasonBanner term={term} progress={progress} />}
      {status === 'Learned' && mode === 'Quiz' && (
        <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Added to Learned List
        </div>
      )}
      {status === 'Learned' && mode !== 'Quiz' && progress && (
        <LearningReview term={term} progress={progress} mode={mode} onReview={onReview} />
      )}
      {status === 'Mastered' && <MasteredBadge />}
      {status === 'New' && (
        <div className="space-y-2">
          <NewWordHint />
          {mode === 'Quiz' ? (
            <QuizForm
              term={term}
              answer={answer}
              quizResult={quizResult}
              knowThisCheck={knowThisCheck}
              onAnswerChange={onAnswerChange}
              onSetKnowThisCheck={onSetKnowThisCheck}
              onSubmit={onSubmit}
              onLearn={onLearn}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                playSound('ding');
                onLearn?.(term);
              }}
              className="w-full rounded-md bg-primary px-3 py-2 text-xs font-bold text-white shadow hover:bg-primary/90 transition-all cursor-pointer"
            >
              I Know This
            </button>
          )}
        </div>
      )}
      {mode === 'Review' && status !== 'Mastered' && (
        <ReviewActions term={term} onReview={onReview} />
      )}
    </div>
    <div className="mt-4 flex shrink-0 items-center justify-between border-t border-border-soft pt-3">
      <WordCardDetails
        term={term}
        showDetails={showDetails}
        onToggle={() => onToggleDetails((v) => !v)}
      />
      <button
        type="button"
        onClick={onToggleFlip}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-extrabold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
      >
        <RotateCw className="h-3.5 w-3.5" />
        <span>3D Flip (Space)</span>
      </button>
    </div>
  </div>
);

export const WordCard = ({ term, progress, mode, onReview, onLearn }: WordCardProps) => {
  const [answer, setAnswer] = useState('');
  const [quizResult, setQuizResult] = useState<boolean | null>(null);
  const [knowThisCheck, setKnowThisCheck] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const status = progress?.status ?? 'New';
  const showAnswer = mode !== 'Quiz' || quizResult !== null;
  const isReviewable = mode === 'Review' && status !== 'Mastered';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
        playSound('flip');
      }
      if (isReviewable) {
        if (e.key === '1') {
          e.preventDefault();
          playSound('error');
          onReview(term, false);
        }
        if (e.key === '2' || e.key === '3' || e.key === '4') {
          e.preventDefault();
          playSound('success');
          onReview(term, true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewable, term, onReview]);

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

  const toggleFlip = () => {
    setIsFlipped((f) => !f);
    playSound('flip');
  };

  return (
    <article
      data-testid="vocabulary-word-card"
      className="relative h-[430px] min-h-[430px] w-full overflow-hidden rounded-xl"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative h-full w-full transition-transform duration-700 rounded-xl shadow-md hover:shadow-xl"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <WordCardFront
          term={term}
          progress={progress}
          mode={mode}
          status={status}
          showAnswer={showAnswer}
          answer={answer}
          quizResult={quizResult}
          knowThisCheck={knowThisCheck}
          showDetails={showDetails}
          onAnswerChange={setAnswer}
          onSetKnowThisCheck={setKnowThisCheck}
          onSubmit={submitQuiz}
          onLearn={onLearn}
          onReview={onReview}
          onToggleDetails={handleToggleDetails}
          onToggleFlip={toggleFlip}
        />

        {/* BACK FACE (180deg ROTATED PHYSICAL BACK) */}
        <div
          className="absolute inset-0 flex min-h-0 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-surface via-surface-hover to-primary/10 p-6 border-2 border-primary/40 shadow-2xl backdrop-blur-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                🇹🇷 TÜRKÇE KARŞILIĞI & ŞANTİYE KULLANIMI
              </span>
              <button
                type="button"
                onClick={() => PronunciationService.speak(term.term)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                title="Listen Pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                {repairVocabularyText(term.turkishMeaning)}
              </h2>
              <p className="text-xs font-mono text-muted-copy mt-1 font-semibold">{term.term}</p>
            </div>

            <div className="space-y-2 rounded-lg bg-surface/80 p-3 border border-border-soft text-xs leading-relaxed">
              <p className="font-semibold text-foreground">
                📌 <span className="font-bold text-primary">İngilizce Örnek:</span>{' '}
                {repairVocabularyText(term.exampleSentence)}
              </p>
              <p className="font-medium text-muted-copy border-t border-border-soft/60 pt-1.5">
                🇹🇷{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Türkçe Çevirisi:
                </span>{' '}
                {repairVocabularyText(term.turkishExample)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-border-soft pt-3">
            <span className="text-[10px] font-mono font-bold text-muted-copy">
              CEFR: {term.cefrLevel}
            </span>
            <button
              type="button"
              onClick={toggleFlip}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-extrabold text-white shadow hover:bg-primary/90 transition-all cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Kartın Ön Yüzü</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
