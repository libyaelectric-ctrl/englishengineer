import { Link } from 'react-router-dom';

type PlanId = 'junior' | 'senior' | 'specialist' | 'master' | 'team';

interface PlanInfo {
  id: PlanId;
  name: string;
  price: string;
  description: string;
}

const PLANS: PlanInfo[] = [
  {
    id: 'junior',
    name: 'Junior',
    price: '$29/mo',
    description: 'Placement Test, Learning Hub, Progress, Vocabulary, Grammar',
  },
  {
    id: 'senior',
    name: 'Senior',
    price: '$59/mo',
    description: 'Junior + Translator, Reading, Writing',
  },
  {
    id: 'specialist',
    name: 'Specialist',
    price: '$79/mo',
    description: 'Senior + Speaking, Listening',
  },
  {
    id: 'master',
    name: 'Master',
    price: '$99/mo',
    description: 'Specialist + Tool, AI Copilot (all modules)',
  },
  { id: 'team', name: 'Team', price: '$999/mo', description: 'Enterprise — Coming Soon' },
];

type PlanStepProps = {
  selectedPlan: PlanId;
  setSelectedPlan: (p: PlanId) => void;
};

export const PlanStep = ({ selectedPlan, setSelectedPlan }: PlanStepProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Choose Your Plan</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Every plan includes your discipline-specific vocabulary pool. Upgrade anytime to unlock
          more modules.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isComingSoon = plan.id === 'team';
          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => !isComingSoon && setSelectedPlan(plan.id)}
              disabled={isComingSoon}
              className={`rounded-[var(--radius-card)] border p-5 text-left transition-all ${isComingSoon ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900' : selectedPlan === plan.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:shadow-sm'}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 dark:text-white">{plan.name}</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {plan.price}
                </span>
              </div>
              {isComingSoon && (
                <span className="inline-block mt-1 text-[10px] bg-slate-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
              )}
              <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {plan.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <Link
          to="/pricing"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View full comparison
        </Link>
        <span className="text-xs text-slate-500">Annual billing saves 20%</span>
      </div>
    </section>
  );
};
