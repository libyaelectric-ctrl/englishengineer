import { useEffect, useState } from 'react';

import { ArrowLeft, CheckCircle, RotateCcw, ShieldAlert, X, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/shallow';

import { useLearningStore } from '@/core/learning';
import { useAuthStore } from '@/features/auth';
import {
  buildLearningPath,
  getPathLevelTerms,
  resolveDefaultDiscipline,
} from '@/features/learning-path';
import { AudioInstructionCard } from '@/features/lesson-runner/components/AudioInstructionCard';
import { DiagramMatchingCard } from '@/features/lesson-runner/components/DiagramMatchingCard';
import { FeedbackDrawer } from '@/features/lesson-runner/components/FeedbackDrawer';
import { MultipleChoiceCard } from '@/features/lesson-runner/components/MultipleChoiceCard';
import { RfiFillBlankCard } from '@/features/lesson-runner/components/RfiFillBlankCard';
import { useLocalizationStore } from '@/features/localization';
import { LearningProfileRepository } from '@/features/profile/profile.repository';
import { resolveTermMeaningAsync } from '@/shared/services/vocabulary-translation.service';
import type { VocabularyTerm } from '@/shared/types/vocabulary.types';

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
  const uiLanguage = useLocalizationStore((state) => state.language);

  const { hearts, loseHeart, masterTerms, completeGenericPractice } = useLearningStore(
    useShallow((state) => ({
      hearts: state.hearts,
      loseHeart: state.loseHeart,
      masterTerms: state.masterTerms,
      completeGenericPractice: state.completeGenericPractice,
    }))
  );

  const profile = LearningProfileRepository.getProfile(currentUser?.id || 'local-user');
  const discipline = resolveDefaultDiscipline(profile.discipline);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
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

        // Resolve meanings in the user's selected language (fr, de, es, ar, etc.)
        const resolvedMeanings = await Promise.all(
          terms.map((term) =>
            resolveTermMeaningAsync(term.term, {
              turkishMeaning: term.turkishMeaning,
              definition: term.definition,
            }, uiLanguage)
          )
        );

        const questionList: LessonQuestion[] = terms.map((term, idx) => {
          const type = CARD_TYPES[idx % CARD_TYPES.length];
          const correctAnswer =
            type === 'diagram'
              ? term.domain || term.category || term.cefrLevel
              : resolvedMeanings[idx];
          const distractorValues = terms
            .filter((_, i) => i !== idx)
            .map((_, i) =>
              type === 'diagram'
                ? terms[i].domain || terms[i].category || terms[i].cefrLevel
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
        if (active) setLoading(false);
      }
    };

    initLesson();
    return () => {
      active = false;
    };
  }, [discipline, levelId, profile.skills.vocabulary.cefrBand]);

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
    if (!correct) loseHeart();
  };

  const handleNextQuestion = () => {
    setIsAnswerChecked(false);
    setSelectedAnswer(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const termIds = questions.map((q) => q.term.id);
      masterTerms(termIds);
      const result = completeGenericPractice('Vocabulary', 90, 5);
      setEarnedCp(result.xp);
      setCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center font-sans text-sm text-[var(--color-muted-copy)]">
        {translate('lesson.loading')}
      </div>
    );
  }

  if (hearts <= 0) {
    return (
      <div className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center font-sans backdrop-blur">
        <ShieldAlert className="h-16 w-16 animate-pulse text-rose-400" />
        <div>
          <h2 className="text-2xl font-black text-rose-100">{translate('lesson.depletedTitle')}</h2>
          <p className="mt-2 text-sm text-rose-200/80">{translate('lesson.depletedDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 font-bold text-white transition-all hover:bg-rose-400"
        >
          <RotateCcw className="h-4 w-4" />
          {translate('lesson.returnToControl')}
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto mt-12 flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center font-sans shadow-2xl backdrop-blur">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
          <CheckCircle className="h-12 w-12" />
        </div>
        <div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            {translate('lesson.completedBadge')}
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-100">
            {translate('lesson.completedTitle')}
          </h2>
          <p className="mt-2 text-sm text-emerald-200/80">
            {translate('lesson.completedDesc').replace('{count}', String(questions.length))}
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-black/40 px-6 py-3">
          <Zap className="h-6 w-6 text-yellow-300" />
          <span className="text-2xl font-black text-yellow-300">+{earnedCp}</span>
          <span className="text-xs font-bold uppercase text-slate-400">
            {translate('lesson.careerPoints')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="w-full rounded-xl bg-emerald-500 py-3.5 font-extrabold text-slate-950 transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-950/50"
        >
          {translate('lesson.backToRoadmap')}
        </button>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-4 font-sans text-sm text-[var(--color-muted-copy)]">
        <p>{translate('lesson.noTerms')}</p>
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="flex items-center gap-2 rounded-xl border border-[var(--color-border-soft)] px-4 py-2 text-xs font-bold"
        >
          <ArrowLeft className="h-4 w-4" /> {translate('lesson.backToRoadmap')}
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-28 pt-4 font-sans">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/learning-path')}
          className="rounded-xl border border-[var(--color-border-soft)] p-2.5 text-[var(--color-muted-copy)] transition-all hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          title={translate('lesson.exitSimulator')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-muted-copy)] tabular-nums">
            <span>
              {translate('lesson.taskProgress')
                .replace('{current}', String(currentIndex + 1))
                .replace('{total}', String(questions.length))}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border-soft)]">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width] duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-amber-400">
          <Zap className="h-4 w-4 text-yellow-300" />
          <span className="text-sm font-extrabold tabular-nums">{hearts * 20}%</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center">
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

      {!isAnswerChecked && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border-soft)] bg-[var(--background)]/90 p-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl justify-end">
            <button
              type="button"
              disabled={!selectedAnswer}
              onClick={handleCheckAnswer}
              className="w-full rounded-xl bg-amber-500 px-8 py-3.5 font-extrabold text-slate-950 transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-amber-950/50 sm:w-auto"
            >
              {translate('lesson.verifySubmittal')}
            </button>
          </div>
        </div>
      )}

      {isAnswerChecked && (
        <FeedbackDrawer
          isCorrect={isCorrect}
          correctAnswer={currentQ.correctAnswer}
          tip={currentQ.term.definition || currentQ.term.exampleSentence}
          onContinue={handleNextQuestion}
          continueText={
            currentIndex + 1 === questions.length
              ? translate('lesson.finishTask')
              : translate('lesson.nextTask')
          }
        />
      )}
    </div>
  );
};

export default LessonRunnerPage;