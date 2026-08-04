import { Award, CheckCircle2, LoaderCircle } from 'lucide-react';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

import { SectionCard } from '@/shared/components/SectionCard';
import { logger } from '@/shared/logger';

import { useLocalizationStore } from '@/features/localization';
import {
  VocabularyMenuService,
  type VocabularyMenuState,
  VocabularyRepository,
  type VocabularyTerm,
  repairVocabularyText,
} from '@/features/vocabulary';
import {
  LEARNED_QUIZ_MINIMUM,
  LEARNED_QUIZ_SIZE,
  isTurkishQuizAnswerCorrect,
  selectRandomQuizItems,
} from '@/features/vocabulary/services/core/learned-quiz';

interface QuizSectionProps {
  menuState: VocabularyMenuState;
}

interface QuizResult {
  mastered: string[];
  struggling: string[];
  kept: string[];
}

const learnedWordIds = (menuState: VocabularyMenuState): string[] =>
  Object.entries(menuState.progress)
    .filter(([, progress]) => progress.status === 'Learned')
    .map(([wordId]) => wordId);

export const QuizSection = ({ menuState }: QuizSectionProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const [quizWords, setQuizWords] = useState<VocabularyTerm[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const finishButtonRef = useRef<HTMLButtonElement | null>(null);
  const learnedIds = learnedWordIds(menuState);
  const canStartQuiz = learnedIds.length >= LEARNED_QUIZ_MINIMUM;
  const isRunning = quizWords.length > 0 && !result;

  useEffect(() => {
    if (isRunning) inputRefs.current[0]?.focus();
  }, [isRunning]);

  const startQuiz = async () => {
    if (!canStartQuiz) return;
    setIsStarting(true);
    setLoadError(null);

    try {
      const selectedIds = selectRandomQuizItems(learnedIds);
      const selectedTerms = await Promise.all(
        selectedIds.map((wordId) => VocabularyRepository.getVocabularyTermById(wordId))
      );
      const words = selectedTerms.filter((term): term is VocabularyTerm => Boolean(term));

      if (words.length !== LEARNED_QUIZ_SIZE) {
        throw new Error('Quiz words could not be loaded.');
      }

      setQuizWords(words);
      setAnswers({});
      setResult(null);
    } catch (e) {
      logger.w('[QUIZ] Failed to start quiz', e);
      setLoadError('The quiz could not be prepared. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const finishQuiz = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mastered: string[] = [];
    const struggling: string[] = [];
    const kept: string[] = [];

    quizWords.forEach((word) => {
      const answer = answers[word.id] ?? '';
      if (!answer.trim()) {
        kept.push(word.id);
      } else if (isTurkishQuizAnswerCorrect(answer, word.turkishMeaning)) {
        mastered.push(word.id);
      } else {
        struggling.push(word.id);
      }
    });

    VocabularyMenuService.completeLearnedQuiz({
      masteredWordIds: mastered,
      strugglingWordIds: struggling,
    });
    setResult({ mastered, struggling, kept });
  };

  const handleAnswerKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const nextInput = inputRefs.current[index + 1];
    if (nextInput) {
      nextInput.focus();
    } else {
      finishButtonRef.current?.focus();
    }
  };

  const backToLearned = () => {
    setQuizWords([]);
    setAnswers({});
    setResult(null);
    setLoadError(null);
  };

  const answeredCount = Object.values(answers).filter((answer) => answer.trim()).length;

  return (
    <SectionCard
      title={translate('vocabulary.learnedQuiz')}
      subtitle={translate('vocabulary.learnedQuizDesc')}
      icon={Award}
    >
      {!isRunning && !result && (
        <div className="space-y-4">
          <div className="grid gap-3 border-y border-border-soft py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                {translate('vocabulary.quizWordsRequired')}
              </p>
              <p className="mt-1 text-xs text-muted-copy">
                {translate('vocabulary.currentLearned')
                  .replace('{current}', String(learnedIds.length))
                  .replace('{required}', String(LEARNED_QUIZ_MINIMUM))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void startQuiz()}
              disabled={!canStartQuiz || isStarting}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[4px] bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-copy"
            >
              {isStarting && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              {translate('vocabulary.startQuiz')}
            </button>
          </div>
          {!canStartQuiz && (
            <p className="text-xs text-muted-copy">{translate('vocabulary.learnWordsToUnlock')}</p>
          )}
          {loadError && (
            <p role="alert" className="text-xs text-rose-600">
              {loadError}
            </p>
          )}
        </div>
      )}

      {isRunning && (
        <form onSubmit={finishQuiz} className="space-y-5" noValidate>
          <div className="flex items-center justify-between border-b border-border-soft pb-3 text-xs text-muted-copy">
            <span>
              {translate('vocabulary.answered')
                .replace('{count}', String(answeredCount))
                .replace('{total}', String(LEARNED_QUIZ_SIZE))}
            </span>
            <span>{translate('vocabulary.completeQuestions')}</span>
          </div>
          <div className="space-y-4">
            {quizWords.map((word, index) => (
              <div key={word.id} className="border-b border-border-soft pb-4 last:border-b-0">
                <label
                  htmlFor={`learned-quiz-${word.id}`}
                  className="block text-xs font-bold uppercase tracking-wider text-muted-copy"
                >
                  {translate('vocabulary.question')} {index + 1} / {LEARNED_QUIZ_SIZE}
                </label>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {repairVocabularyText(word.term)}
                </p>
                <p className="mt-1 text-sm text-muted-copy">
                  {translate('vocabulary.typeTurkishMeaning')}
                </p>
                <input
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  id={`learned-quiz-${word.id}`}
                  type="text"
                  value={answers[word.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [word.id]: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => handleAnswerKeyDown(event, index)}
                  autoComplete="off"
                  className="mt-2 w-full max-w-xl rounded-[4px] border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-border-soft pt-4">
            <button
              ref={finishButtonRef}
              type="submit"
              className="min-h-10 rounded-[4px] bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {translate('vocabulary.finishQuiz')}
            </button>
          </div>
        </form>
      )}

      {result && (
        <div className="space-y-4" aria-live="polite">
          <div className="flex items-center gap-3 border-b border-border-soft pb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <div>
              <h5 className="text-base font-semibold text-foreground">
                {translate('vocabulary.quizComplete')}
              </h5>
              <p className="text-xs text-muted-copy">{translate('vocabulary.quizUpdated')}</p>
            </div>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.correct')}</dt>
              <dd className="font-semibold text-emerald-600">{result.mastered.length}</dd>
            </div>
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.wrong')}</dt>
              <dd className="font-semibold text-rose-600">{result.struggling.length}</dd>
            </div>
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.skipped')}</dt>
              <dd className="font-semibold text-foreground">{result.kept.length}</dd>
            </div>
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.movedToMastered')}</dt>
              <dd className="font-semibold text-emerald-600">{result.mastered.length}</dd>
            </div>
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.movedToStruggling')}</dt>
              <dd className="font-semibold text-rose-600">{result.struggling.length}</dd>
            </div>
            <div>
              <dt className="text-muted-copy">{translate('vocabulary.stayedInLearned')}</dt>
              <dd className="font-semibold text-foreground">{result.kept.length}</dd>
            </div>
          </dl>
          <div className="flex justify-end border-t border-border-soft pt-4">
            <button
              type="button"
              onClick={backToLearned}
              className="min-h-10 rounded-[4px] border border-border-soft px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-hover"
            >
              {translate('vocabulary.backToLearned')}
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
