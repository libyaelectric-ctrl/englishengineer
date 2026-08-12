import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLocalizationStore } from '@/features/localization';

const PLANS = [
  { name: 'Junior', price: '$29', popular: false, soon: false },
  { name: 'Senior', price: '$59', popular: true, soon: false },
  { name: 'Specialist', price: '$79', popular: false, soon: false },
  { name: 'Master', price: '$99', popular: false, soon: false },
  { name: 'Team', price: '$$$$', popular: false, soon: true },
] as const;

export const PricingSection = () => {
  const navigate = useNavigate();
  const t = useLocalizationStore((s) => s.translate);

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-copy">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {PLANS.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => navigate('/pricing')}
              className="group relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-border-soft)] bg-[var(--color-surface)] p-6 text-center transition-all hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg"
            >
              {plan.popular && (
                <span className="absolute -top-3 rounded-full bg-[var(--color-primary)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {t('pricing.mostPopular')}
                </span>
              )}
              {plan.soon && (
                <span className="absolute -top-3 rounded-full bg-slate-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {t('pricing.comingSoon')}
                </span>
              )}

              <span className="text-lg font-bold">{plan.name}</span>
              <span className="text-4xl font-extrabold text-[var(--color-primary)]">
                {plan.price}
              </span>
              <span className="text-[10px] font-medium text-muted-copy">
                {t('pricing.perMonth')}
              </span>

              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] opacity-0 transition-opacity group-hover:opacity-100">
                {t('pricing.choosePlan')}
                <ArrowRight className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};