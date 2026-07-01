import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth';
import {
  PLACEMENT_QUESTIONS,
  PlacementService,
  usePlacementStore,
} from '@/features/placement';
import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';

const PlacementPage = () => {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.currentUser?.id ?? 'local-user');
  const {
    currentIndex,
    answers,
    result,
    answer,
    next,
    previous,
    submit,
    reset,
  } = usePlacementStore();
  const question = PLACEMENT_QUESTIONS[currentIndex];
  const isLast = currentIndex === PLACEMENT_QUESTIONS.length - 1;

  const continueAtA1 = () => {
    PlacementService.startAtA1(userId);
    navigate('/curriculum', { replace: true });
  };

  if (result) {
    return (
      <main className="mx-auto max-w-3xl py-4 sm:py-8">
        <section className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="mt-5 text-xs font-black uppercase text-emerald-700">
            Placement complete
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Recommended start: {result.recommendedBand}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Confidence: {result.confidence}. Reading, Vocabulary and Grammar use
            this local estimate. Writing, Listening and Speaking remain at A1
            until their own activity provides evidence.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Score</p>
              <p className="mt-1 text-2xl font-black">{result.score}%</p>
            </div>
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Priority</p>
              <p className="mt-1 font-black capitalize">
                {result.priorityAreas[0] ?? 'Consolidation'}
              </p>
            </div>
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500">Evidence</p>
              <p className="mt-1 font-black">Local rules</p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="outline" onClick={reset}>
              Retake placement
            </Button>
            <Button onClick={() => navigate('/curriculum', { replace: true })}>
              Open Learning Hub <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl py-4 sm:py-8">
      <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-50 p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-sky-700" />
            <div>
              <p className="text-xs font-black uppercase text-sky-700">
                Placement MVP
              </p>
              <h1 className="text-xl font-black text-slate-950">
                Find a practical starting point
              </h1>
            </div>
          </div>
          <ProgressBar
            value={((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}
            className="mt-5"
          />
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Question {currentIndex + 1} of {PLACEMENT_QUESTIONS.length}
          </p>
        </header>

        <div className="p-5 sm:p-7">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase text-slate-600">
            {question.domain} · {question.band}
          </span>
          <h2 className="mt-5 text-lg font-black leading-7 text-slate-950">
            {question.prompt}
          </h2>
          <div className="mt-5 grid gap-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(question.id, choiceIndex)}
                className={`min-h-12 rounded-[12px] border px-4 py-3 text-left text-sm font-semibold transition-colors ${answers[question.id] === choiceIndex ? 'border-sky-300 bg-sky-50 text-sky-900' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60'}`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:px-7">
          <Button
            variant="ghost"
            onClick={currentIndex === 0 ? continueAtA1 : previous}
          >
            <ArrowLeft className="h-4 w-4" />
            {currentIndex === 0 ? 'Start at A1' : 'Previous'}
          </Button>
          <Button
            disabled={!Number.isInteger(answers[question.id])}
            onClick={() => (isLast ? submit(userId) : next())}
          >
            {isLast ? 'Finish placement' : 'Next'}{' '}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </footer>
      </section>
      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        This is an internal Engineering Communication estimate, not an official
        CEFR certificate.
      </p>
    </main>
  );
};

export default PlacementPage;
