import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { useNavigate } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { ProgressBar } from '@/shared/components/ProgressBar';
import {
  type PipelineStation,
  UniversalCyberPipeline,
} from '@/shared/components/UniversalCyberPipeline';

import { useAuthStore } from '@/features/auth';
import { useLocalizationStore } from '@/features/localization';
import { interpolate } from '@/features/localization/interpolate';
import { PLACEMENT_QUESTIONS, PlacementService, usePlacementStore } from '@/features/placement';

const DIAGNOSTIC_STATIONS: Array<{ id: string; label: string; band: string; threshold: number }> = [
  { id: 'diag-a1', label: 'A1 Diagnostic', band: 'A1', threshold: 1 },
  { id: 'diag-a2', label: 'A2 Calibration', band: 'A2', threshold: 3 },
  { id: 'diag-b1', label: 'B1 Core', band: 'B1', threshold: 5 },
  { id: 'diag-b2', label: 'B2 Engineering', band: 'B2', threshold: 6 },
  { id: 'diag-c1', label: 'C1 Advanced', band: 'C1', threshold: 7 },
  { id: 'diag-c2', label: 'C2 Expert', band: 'C2', threshold: 8 },
];

const PlacementPage = () => {
  const navigate = useNavigate();
  const translate = useLocalizationStore((s) => s.translate);
  const userId = useAuthStore((state) => state.currentUser?.id ?? 'local-user');
  const { currentIndex, answers, result, answer, next, previous, submit, reset } =
    usePlacementStore(
      useShallow((s) => ({
        currentIndex: s.currentIndex,
        answers: s.answers,
        result: s.result,
        answer: s.answer,
        next: s.next,
        previous: s.previous,
        submit: s.submit,
        reset: s.reset,
      }))
    );
  const question = PLACEMENT_QUESTIONS[currentIndex];
  const isLast = currentIndex === PLACEMENT_QUESTIONS.length - 1;

  const placementStations: PipelineStation[] = DIAGNOSTIC_STATIONS.map((station, idx) => {
    const completed = currentIndex >= station.threshold;
    const previousThreshold = idx === 0 ? 0 : DIAGNOSTIC_STATIONS[idx - 1].threshold;
    const isInProgress = !completed && currentIndex >= previousThreshold;
    return {
      id: station.id,
      levelBadge: station.band,
      title: station.label,
      status: completed ? 'completed' : isInProgress ? 'in-progress' : 'available',
      progressRatio: completed ? 1 : isInProgress ? 0.5 : 0,
      totalItems: 1,
      completedItems: completed ? 1 : 0,
    };
  });
  const activeDiagnosticStation =
    placementStations.find((station) => station.status === 'in-progress')?.id ??
    placementStations[0]?.id;

  const continueAtA1 = () => {
    PlacementService.startAtA1(userId);
    navigate('/curriculum', { replace: true });
  };

  if (result) {
    return (
      <main className="mx-auto max-w-3xl py-4 sm:py-8">
        <section className="rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="mt-5 text-xs font-medium uppercase text-success">Placement complete</p>
          <h1 className="mt-2 text-3xl font-medium text-foreground">
            Recommended start: {result.recommendedBand}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-copy">
            Confidence: {result.confidence}. Reading, Vocabulary and Grammar use this local
            estimate. Writing, Listening and Speaking remain at A1 until their own activity provides
            evidence.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted-copy">Score</p>
              <p className="mt-1 text-2xl font-medium">{result.score}%</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-hover p-4">
              <p className="text-xs font-medium text-muted-copy">Priority</p>
              <p className="mt-1 font-medium capitalize">
                {result.priorityAreas[0] ?? 'Consolidation'}
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-border-soft bg-surface-hover p-4">
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
      <UniversalCyberPipeline
        title={translate('pipeline.placement.title')}
        subtitle={translate('pipeline.placement.subtitle')}
        badgeText={interpolate(translate('pipeline.placement.questionBadge'), {
          current: currentIndex + 1,
          total: PLACEMENT_QUESTIONS.length,
        })}
        icon={ClipboardCheck}
        stations={placementStations}
        activeStationId={activeDiagnosticStation}
        onSelectStation={() => {}}
        metrics={[
          {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
            label: translate('pipeline.metric.answered'),
            value: currentIndex,
          },
          {
            icon: <ClipboardCheck className="h-4 w-4 text-cyan-400" />,
            label: translate('pipeline.metric.total'),
            value: PLACEMENT_QUESTIONS.length,
          },
          {
            icon: <ArrowRight className="h-4 w-4 text-amber-400" />,
            label: translate('pipeline.metric.progress'),
            value: `${Math.round(((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100)}%`,
          },
        ]}
      />
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-border-soft bg-surface">
        <header className="border-b border-border-soft bg-surface-hover p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs font-medium uppercase text-primary">Placement MVP</p>
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
          <span className="rounded-[4px] border border-border-soft bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            {question.domain} · {question.band}
          </span>
          <h2 className="mt-5 text-sm font-bold text-foreground">{question.prompt}</h2>
          <div className="mt-5 grid gap-3">
            {question.choices.map((choice, choiceIndex) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(question.id, choiceIndex)}
                className={`min-h-12 rounded-[4px] border border-border-soft px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                  answers[question.id] === choiceIndex
                    ? 'border-primary/40 bg-primary/10 text-foreground'
                    : 'bg-surface text-muted-copy hover:border-primary'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft bg-background p-4 sm:px-7">
          <Button
            variant="ghost"
            onClick={currentIndex === 0 ? continueAtA1 : previous}
            className="rounded-[4px] border border-border-soft bg-surface hover:bg-background text-xs font-bold uppercase tracking-wider text-primary cursor-pointer shadow-sm min-h-9 px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentIndex === 0 ? 'Start at A1' : 'Previous'}
          </Button>
          <Button
            disabled={!Number.isInteger(answers[question.id])}
            onClick={() => (isLast ? submit(userId) : next())}
          >
            {isLast ? 'Finish placement' : 'Next'} <ArrowRight className="h-4 w-4" />
          </Button>
        </footer>
      </section>
      <p className="mt-4 text-center text-xs leading-5 text-muted-copy">
        This is an internal Engineering Communication estimate, not an official CEFR certificate.
      </p>
    </main>
  );
};

export default PlacementPage;
