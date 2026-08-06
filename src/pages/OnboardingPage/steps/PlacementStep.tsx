import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { ProgressBar } from '@/shared/components/ProgressBar';

import { useAuthStore } from '@/features/auth';
import { PLACEMENT_QUESTIONS, usePlacementStore } from '@/features/placement';
import { useLocalizationStore } from '@/features/localization';

type PlacementStepProps = {
  onComplete: () => void;
};

export const PlacementStep = ({ onComplete }: PlacementStepProps) => {
  const { translate } = useLocalizationStore();
  const userId = useAuthStore((state) => state.currentUser?.id ?? 'local-user');
  const { currentIndex, result, answer, next, previous, submit, answers } = usePlacementStore(
    useShallow((s) => ({
      currentIndex: s.currentIndex,
      result: s.result,
      answer: s.answer,
      next: s.next,
      previous: s.previous,
      submit: s.submit,
      answers: s.answers,
    }))
  );
  const question = PLACEMENT_QUESTIONS[currentIndex];
  const isLast = currentIndex === PLACEMENT_QUESTIONS.length - 1;

  if (result) {
    return (
      <section className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-emerald-600">
            {translate('onboarding.placementComplete') ?? 'Placement complete'}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {translate('onboarding.recommendedStart') ?? 'Recommended start:'}{' '}
            <span className="text-blue-600 dark:text-blue-400">{result.recommendedBand}</span>
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {translate('onboarding.placementConfidence') ?? 'Confidence:'} {result.confidence}
          </p>
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="mx-auto rounded-lg bg-blue-600 hover:bg-blue-500 px-8 py-3 text-sm font-bold text-white shadow-sm"
        >
          {translate('onboarding.continue') ?? 'Continue'}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-5 w-5 text-blue-500" />
        <p className="text-xs font-medium text-slate-500">
          {translate('onboarding.placementProgress') ?? 'Question'} {currentIndex + 1} / {PLACEMENT_QUESTIONS.length}
        </p>
      </div>
      <ProgressBar value={currentIndex + 1} max={PLACEMENT_QUESTIONS.length} />

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-base font-medium text-slate-900 dark:text-white">{question.prompt}</p>
        <div className="mt-4 space-y-2">
          {question.choices.map((choice, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => answer(question.id, idx)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                answers[question.id] === idx
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={previous}
          disabled={currentIndex === 0}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-surface"
        >
          {translate('onboarding.back') ?? 'Back'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isLast) {
              submit(userId);
            } else {
              next();
            }
          }}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-2 text-sm font-bold text-white shadow-sm"
        >
          {isLast
            ? (translate('onboarding.finish') ?? 'Finish')
            : (translate('onboarding.next') ?? 'Next')}
        </button>
      </div>
    </section>
  );
};