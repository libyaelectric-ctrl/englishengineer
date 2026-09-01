import { ArrowLeft, Cpu, RotateCcw, ShieldAlert, X, Zap } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useLearningStore } from '@/core/learning';

import { resolveTermMeaningAsync } from '@/shared/services/vocabulary-translation.service';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

import { useAuthStore } from '@/features/auth';
import {
  buildLearningPath,
  getPathLevelTerms,
  resolveDefaultDiscipline,
} from '@/features/learning-path';
import { AudioInstructionCard } from '@/features/lesson-runner/components/AudioInstructionCard';
import { DiagramMatchingCard } from '@/features/lesson-runner/components/DiagramMatchingCard';
import { LessonCompleteScreen } from '@/features/lesson-runner/components/LessonCompleteScreen';
import { MultipleChoiceCard } from '@/features/lesson-runner/components/MultipleChoiceCard';
import { RfiFillBlankCard } from '@/features/lesson-runner/components/RfiFillBlankCard';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { useLearningLanguage } from '@/features/profile/use-learning-language';

type LessonCardType = 'mc' | 'rfi' | 'audio' | 'diagram';

interface LessonQuestion {
  term: VocabularyTerm;
  type: LessonCardType;
  correctAnswer: string;
  options: string[];
}

const CARD_TYPES: LessonCardType[] = ['mc', 'rfi', 'audio', 'diagram'];

const LessonRunnerPage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);
  const translate = useLocalizationStore((state) => state.translate);
  const learningLanguage = useLearningLanguage();

  const { hearts, loseHeart, masterTerms, markTermWeak, clearWeakTerm, completeGenericPractice } =
    useLearningStore(
      useShallow((state) => ({
        hearts: state.hearts,
        loseHeart: state.loseHeart,
        masterTerms: state.masterTerms,
        markTermWeak: state.markTermWeak,
        clearWeakTerm: state.clearWeakTerm,
        completeGenericPractice: state.completeGenericPractice,
      }))
    );

  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  const discipline = resolveDefaultDiscipline(profile.discipline);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [earnedCp, setEarnedCp] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const initLesson = async () => {
      try {
        const path = await buildLearningPath(discipline, {
          currentBand: profile.skills.vocabulary.cefrBand,
        });

        const targetId = levelId || path.stages[0]?.levels[0]?.id;
        if (!targetId) return;

        const terms = await getPathLevelTerms(path, targetId);
        if (!active) return;

        if (terms.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        // Spaced repetition: surface previously-weak terms first so they get re-practiced.
        const weakIds = useLearningStore.getState().weakTermIds;
        const weakFirstTerms = [...terms].sort((a, b) => {
          const aWeak = weakIds.includes(a.id) ? 0 : 1;
          const bWeak = weakIds.includes(b.id) ? 0 : 1;
          return aWeak - bWeak;
        });

        // Resolve meanings in the user's selected language (fr, de, es, ar, etc.)
        const resolvedMeanings = await Promise.all(
          weakFirstTerms.map((term) =>
            resolveTermMeaningAsync(
              term.term,
              {
                turkishMeaning: term.turkishMeaning,
                definition: term.definition,
              },
              learningLanguage
            )
          )
        );

        const questionList: LessonQuestion[] = weakFirstTerms.map((term, idx) => {
          const type = CARD_TYPES[idx % CARD_TYPES.length];
          const correctAnswer =
            type === 'diagram'
              ? term.domain || term.category || term.cefrLevel
              : resolvedMeanings[idx];
          const distractorValues = weakFirstTerms
            .filter((_, i) => i !== idx)
            .map((_, i) =>
              type === 'diagram'
                ? weakFirstTerms[i].domain ||
                  weakFirstTerms[i].category ||
                  weakFirstTerms[i].cefrLevel
                : resolvedMeanings[i]
            );
          const options = Array.from(new Set([correctAnswer, ...distractorValues]))
            .slice(0, 4)
            .sort(() => Math.random() - 0.5);

          return { term, type, correctAnswer, options };
        });

        setQuestions(questionList);
        setLoading(false);
      } catch {
        if (active) {
          setLoading(false);
          setLoadError(true);
        }
      }
    };

    initLesson();
    return () => {
      active = false;
    };
  }, [discipline, levelId, profile.skills.vocabulary.cefrBand, learningLanguage]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (selected: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(selected);
  };

  const handleCheckAnswer = () => {
    if (!currentQ || !selectedAnswer || isAnswerChecked) return;
    const correct =
      selectedAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    if (correct) {
      setCorrectCount((prev) => prev + 1);
      clearWeakTerm(currentQ.term.id);
    } else {
      loseHeart();
      markTermWeak(currentQ.term.id);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswerChecked(false);
    setSelectedAnswer(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const termIds = questions.map((q) => q.term.id);
      masterTerms(termIds);
      const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      const result = completeGenericPractice('Vocabulary', score, questions.length);
      setEarnedCp(result.xp);
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 font-sans text-sm text-[var(--color-primary)]">
        <Cpu className="h-8 w-8 animate-pulse" />
        <p className="font-bold tracking-wider uppercase text-xs">{translate('lesson.loading')}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 font-sans text-sm text-[var(--color-muted-copy)]">
        <ShieldAlert className="h-10 w-10 text-rose-400" />
        <p>{translate('learningpath.error')}</p>
        <button
          type="button"
          onClick={async () => {
            const { reloadApp } = await import('@/shared/utils/capacitor');
            await reloadApp();
          }}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface)] px-5 py-2.5 text-xs font-bold text-[var(--foreground)] shadow hover:bg-[var(--surface-hover)]"
        >
          <RotateCcw className="h-4 w-4" /> {translate('lesson.backToRoadmap')}
        </button>
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-8 text-center font-sans shadow-[0_0_35px_rgba(244,63,94,0.25)] backdrop-blur-xl">
        <ShieldAlert className="h-16 w-16 animate-pulse text-rose-400" />
        <div>
          <h2 className="text-2xl font-black text-rose-100">{translate('lesson.depletedTitle')}</h2>
          <p className="mt-2 text-sm text-rose-200/80">{translate('lesson.depletedDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-rose-400"
        >
          <RotateCcw className="h-4 w-4" />
          {translate('lesson.returnToControl')}
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <LessonCompleteScreen
        earnedCp={earnedCp}
        correctCount={correctCount}
        totalCount={questions.length}
        onContinue={() => navigate('/learning-path')}
        onBackToRoadmap={() => navigate('/learning-path')}
        translate={translate}
      />
    );
  }

  if (!currentQ) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 font-sans text-sm text-[var(--color-muted-copy)]">
        <p>{translate('lesson.noTerms')}</p>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface)] px-5 py-2.5 text-xs font-bold text-[var(--foreground)] shadow hover:bg-[var(--surface-hover)]"
        >
          <ArrowLeft className="h-4 w-4" /> {translate('lesson.backToRoadmap')}
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="relative w-full overflow-x-hidden flex flex-col gap-6 pb-8 pt-4 font-sans text-[var(--foreground)]">
      {/* Cyber Telemetry Top HUD Bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--surface)] p-3.5 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/learning-path')}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface-hover)] px-3 text-[var(--color-muted-copy)] transition-all hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            title={translate('lesson.backToRoadmap')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden text-xs font-bold sm:inline">
              {translate('lesson.backToRoadmap')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/learning-path')}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--color-border-soft)] bg-[var(--surface-hover)] text-[var(--color-muted-copy)] transition-all hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
            title={translate('lesson.exitSimulator')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Conduit */}
        <div className="flex flex-1 flex-col gap-1.5 px-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-copy)] tabular-nums">
            <span className="flex items-center gap-1.5 text-[var(--color-primary)]">
              <Cpu className="h-3.5 w-3.5" />
              {translate('lesson.taskProgress')
                .replace('{current}', String(currentIndex + 1))
                .replace('{total}', String(questions.length))}
            </span>
            <span className="font-extrabold text-[var(--foreground)]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-hover)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* System Integrity (Hearts) */}
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-black tabular-nums">{hearts * 20}%</span>
        </div>
      </div>

      {/* Simulator Question Container */}
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-[var(--color-border-soft)] bg-[var(--surface)] p-6 sm:p-8 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-xl">
        <div className="w-full flex justify-center">
          {currentQ.type === 'mc' && (
            <MultipleChoiceCard
              term={currentQ.term}
              options={currentQ.options}
              onSelectOption={handleSelectOption}
              disabled={isAnswerChecked}
            />
          )}
          {currentQ.type === 'rfi' && (
            <RfiFillBlankCard
              term={currentQ.term}
              options={currentQ.options}
              onSelectOption={handleSelectOption}
              disabled={isAnswerChecked}
            />
          )}
          {currentQ.type === 'audio' && (
            <AudioInstructionCard
              term={currentQ.term}
              options={currentQ.options}
              onSelectOption={handleSelectOption}
              disabled={isAnswerChecked}
              learningLanguage={learningLanguage}
            />
          )}
          {currentQ.type === 'diagram' && (
            <DiagramMatchingCard
              term={currentQ.term}
              options={currentQ.options}
              onSelectOption={handleSelectOption}
              disabled={isAnswerChecked}
            />
          )}
        </div>

        {/* In-Card Verification Action Bar (Never covers sidebar or bottom footer) */}
        {!isAnswerChecked && (
          <div className="mt-8 flex w-full max-w-xl items-center justify-end border-t border-[var(--color-border-soft)] pt-5">
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={handleCheckAnswer}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all hover:scale-102 hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {translate('lesson.verifySubmittal')}
            </button>
          </div>
        )}

        {/* In-Card Feedback Drawer/Panel */}
        {isAnswerChecked && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 w-full max-w-xl rounded-xl border p-4 backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-200"
            style={{
              borderColor: isCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(244,63,94,0.5)',
              backgroundColor: isCorrect ? 'rgba(6,78,59,0.4)' : 'rgba(136,19,55,0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p
                  className={`text-sm font-black uppercase tracking-wider ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}
                >
                  {isCorrect
                    ? translate('lesson.correctSubmission')
                    : translate('lesson.incorrectSubmission')}
                </p>
                {!isCorrect && (
                  <p className="mt-1 text-xs text-[var(--color-muted-copy)]">
                    {translate('lesson.correctAnswer')}:{' '}
                    <strong className="text-[var(--foreground)] font-bold">
                      {currentQ.correctAnswer}
                    </strong>
                  </p>
                )}
                {currentQ.term.definition && (
                  <p className="mt-1 text-[11px] text-[var(--color-muted-copy)] line-clamp-2">
                    {currentQ.term.definition}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className={`flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl px-7 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all ${
                  isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-rose-500 hover:bg-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                }`}
              >
                {currentIndex + 1 === questions.length
                  ? translate('lesson.finishTask')
                  : translate('lesson.nextTask')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonRunnerPage;
