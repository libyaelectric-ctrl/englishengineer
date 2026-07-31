import { CheckCircle2 } from 'lucide-react';

import { Link } from 'react-router-dom';

import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';

import { AnimatedCard } from './AnimatedComponents';

const LANDING_PLANS = COMMERCIAL_PLAN_CATALOG.filter((p) =>
  ['free', 'pro', 'project'].includes(p.id)
);

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-border-soft bg-background px-6 py-8 md:px-12 md:py-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Single Row Compact Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Pricing
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Start free. Upgrade when ready.
            </h2>
          </div>
          <p className="text-xs text-foreground/80 font-medium max-w-xl leading-tight">
            Transparent plans tailored for individual engineers and full project teams.
          </p>
        </div>

        {/* Compact 3-Tier Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
          {LANDING_PLANS.map((plan, index) => {
            const isPrimary = plan.id === 'pro';
            return (
              <AnimatedCard
                key={plan.id}
                delay={index * 50}
                className={`flex flex-col p-5 h-full justify-between transition-all duration-300 rounded-xl relative ${
                  isPrimary
                    ? 'border-2 border-primary shadow-xl bg-surface scale-[1.01] light-sweep-container'
                    : 'border border-border-soft bg-surface'
                }`}
              >
                {isPrimary && (
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary via-blue-500 to-indigo-600 blur-md opacity-40 animate-ambient-glow pointer-events-none" />
                )}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        {plan.name}
                      </h3>
                      {isPrimary ? (
                        <span className="rounded bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Popular
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-3xl font-extrabold tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-xs text-muted-copy font-medium">
                        {plan.cadence || ''}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-copy min-h-[32px]">
                      {plan.priceReason}
                    </p>

                    <div className="my-4 border-t border-border-soft/60" />

                    <ul className="space-y-2.5">
                      {plan.benefits.map((f: string) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="text-xs text-foreground leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-2">
                    <Link
                      to="/signup"
                      className={`block w-full rounded-lg px-4 py-2.5 text-center text-xs font-bold transition-all shadow-sm ${
                        isPrimary
                          ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                          : 'bg-background text-foreground border border-border-soft hover:bg-surface-hover'
                      }`}
                    >
                      {plan.id === 'free' ? 'Start Free' : 'Get Started'}
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
