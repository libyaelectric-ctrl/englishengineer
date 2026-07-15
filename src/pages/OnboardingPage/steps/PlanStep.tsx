type PlanId = 'free' | 'pro' | 'enterprise';

const PLANS: Array<{ id: PlanId; label: string; text: string }> = [
  {
    id: 'free',
    label: 'Free',
    text: 'Start locally with core learning.',
  },
  {
    id: 'pro',
    label: 'Pro',
    text: 'Personal advanced features when backend services are active.',
  },
  {
    id: 'enterprise',
    label: 'Team',
    text: 'Manager and team workflows for organizations.',
  },
];

type PlanStepProps = {
  selectedPlan: PlanId;
  setSelectedPlan: (p: PlanId) => void;
};

export const PlanStep = ({ selectedPlan, setSelectedPlan }: PlanStepProps) => (
  <section>
    <h2 className="text-xl font-medium">Choose your starting workspace</h2>
    <p className="mt-2 text-sm text-muted-copy">
      Plan selection does not activate billing. Local mode remains Free until
      the backend verifies a subscription.
    </p>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {PLANS.map((plan) => (
        <button
          type="button"
          key={plan.id}
          onClick={() => setSelectedPlan(plan.id)}
          className={`rounded-xl border p-5 text-left transition-colors ${selectedPlan === plan.id ? 'border-primary/30 bg-primary/10' : 'border-border-soft bg-surface hover:border-primary/20 hover:bg-surface-hover'}`}
        >
          <span className="font-medium text-foreground">{plan.label}</span>
          <span className="mt-2 block text-xs leading-5 text-muted-copy">
            {plan.text}
          </span>
        </button>
      ))}
    </div>
  </section>
);
