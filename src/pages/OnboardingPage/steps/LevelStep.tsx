import { useLocalizationStore } from '@/features/localization';
import type { SelfReportedCefr } from '@/features/profile/profile.types';

const LEVELS: SelfReportedCefr[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'unknown'];

type LevelStepProps = {
  selfReportedCefr: SelfReportedCefr;
  setSelfReportedCefr: (l: SelfReportedCefr) => void;
};

export const LevelStep = ({ selfReportedCefr, setSelfReportedCefr }: LevelStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.whatIsLevel')}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-copy">{translate('onboarding.levelDesc')}</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {LEVELS.map((level) => (
          <button
            type="button"
            key={level}
            onClick={() => setSelfReportedCefr(level)}
            className={`min-h-14 rounded-lg border text-sm font-medium transition-colors ${selfReportedCefr === level ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border-soft bg-surface text-foreground hover:border-primary/20 hover:bg-surface-hover'}`}
          >
            {level === 'unknown' ? translate('onboarding.notSure') : level}
          </button>
        ))}
      </div>
    </section>
  );
};
