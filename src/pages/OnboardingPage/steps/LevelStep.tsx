import type { SelfReportedCefr } from '@/features/profile/profile.types';

const LEVELS: SelfReportedCefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'unknown'];

type LevelStepProps = {
  selfReportedCefr: SelfReportedCefr;
  setSelfReportedCefr: (l: SelfReportedCefr) => void;
};

export const LevelStep = ({
  selfReportedCefr,
  setSelfReportedCefr,
}: LevelStepProps) => (
  <section>
    <h2 className="text-xl font-medium">What is your current English level?</h2>
    <p className="mt-2 text-sm leading-6 text-muted-copy">
      This is a self-reported starting reference, not a certificate or placement
      result. Reading, Writing, Listening and Speaking still begin and progress
      independently.
    </p>
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {LEVELS.map((level) => (
        <button
          type="button"
          key={level}
          onClick={() => setSelfReportedCefr(level)}
          className={`min-h-14 rounded-lg border text-sm font-medium transition-colors ${selfReportedCefr === level ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-surface-hover'}`}
        >
          {level === 'unknown' ? 'I am not sure' : level}
        </button>
      ))}
    </div>
  </section>
);
