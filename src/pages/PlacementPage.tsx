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
        <section className="rounded-xl border border-border-soft bg-surface p-6 sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="mt-5 text-xs font-medium uppercase text-success">
            Placement complete
          </p>
          <h1 className="mt-2 text-3xl font-medium text-foreground">
            Recommended start: {result.recommendedBand}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-copy">
            Confidence: {result.confidence}. Reading, Vocabulary and Grammar use
            this local estimate. Writing, Listening and Speaking remain at A1
            until their own activity provides evidence.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted-copy">Score</p>
              <p className="mt-1 text-2xl font-medium">{result.score}%</p>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted-copy">Priority</p>
              <p className="mt-1 font-medium capitalize">
                {result.priorityAreas[0] ?? 'Consolidation'}
              </p>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted-copy">Evidence</p>
              <p className="mt-1 font-medium">Local rules</p>
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
      <section className="overflow-hidden rounded-xl border border-border-soft bg-surface">
        <header className="border-b border-border-soft bg-surface-hover p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase text-primary">
                Placement MVP
              </p>
              <h1 className="text-xl font-medium text-foreground">
                Find a practical starting point
              </h1>
            </div>
          </div>
          <ProgressBar
            value={((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}
            className="mt-5"
          />
          <p className="mt-2 text-xs font-medium text-muted-copy">
            Question {currentIndex + 1} of {PLACEMENT_QUESTIONS.length}
          </p>
        </header>

        <div className="p-5 sm:p-7 font-sans">
          <span className="rounded-[4px] border border-[#d9d9e3] bg-[#faf8ff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            {question.domain} · {question.band}
          </span>
          <h2 className="mt-5 text-sm font-bold text-foreground">
            {question.prompt}
          </h2>
          <div className="mt-5 grid gap-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(question.id, choiceIndex)}
                className={`min-h-12 rounded-[4px] border border-[#d9d9e3] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                  answers[question.id] === choiceIndex
                    ? 'border-[#0047bb]/40 bg-[#0047bb]/10 text-foreground'
                    : 'bg-white text-muted-copy hover:border-[#0047bb]'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d9d9e3] bg-[#faf8ff] p-4 sm:px-7">
          <Button
            variant="ghost"
            onClick={currentIndex === 0 ? continueAtA1 : previous}
            className="rounded-[4px] border border-[#d9d9e3] bg-white hover:bg-[#faf8ff] text-xs font-bold uppercase tracking-wider text-[#0047bb] cursor-pointer shadow-sm min-h-9 px-4"
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
      <p className="mt-4 text-center text-xs leading-5 text-muted-copy">
        This is an internal Engineering Communication estimate, not an official
        CEFR certificate.
      </p>
    </main>
  );
};

export default PlacementPage;
