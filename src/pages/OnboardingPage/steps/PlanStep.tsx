import { useLocalizationStore } from '@/features/localization';
import type { TranslationKey } from '@/features/localization';

type PlanId = 'free' | 'pro' | 'enterprise';

const PLANS: Array<{ id: PlanId; label: TranslationKey; text: TranslationKey }> = [
  {
    id: 'free',
    label: 'onboarding.free',
    text: 'onboarding.freeDesc',
  },
  {
    id: 'pro',
    label: 'onboarding.pro',
    text: 'onboarding.proDesc',
  },
  {
    id: 'enterprise',
    label: 'onboarding.team',
    text: 'onboarding.teamDesc',
  },
];

type PlanStepProps = {
  selectedPlan: PlanId;
  setSelectedPlan: (p: PlanId) => void;
};

export const PlanStep = ({ selectedPlan, setSelectedPlan }: PlanStepProps) => {
  const { translate } = useLocalizationStore();

  return (
    <section>
      <h2 className="text-xl font-medium">{translate('onboarding.chooseWorkspace')}</h2>
      <p className="mt-2 text-sm text-muted-copy">{translate('onboarding.planDesc')}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <button
            type="button"
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-xl border p-5 text-left transition-colors ${selectedPlan === plan.id ? 'border-primary/30 bg-primary/10' : 'border-border-soft bg-surface hover:border-primary/20 hover:bg-surface-hover'}`}
          >
            <span className="font-medium text-foreground">{translate(plan.label)}</span>
            <span className="mt-2 block text-xs leading-5 text-muted-copy">
              {translate(plan.text)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
