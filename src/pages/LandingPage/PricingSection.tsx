import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

// Show only the main 3 plans on landing (free, pro, project)
const LANDING_PLANS = COMMERCIAL_PLAN_CATALOG.filter((p) =>
  ['free', 'pro', 'project'].includes(p.id)
);

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-border-soft bg-background px-6 py-12 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Pricing"
          title={<>Start free. Upgrade when ready.</>}
          align="center"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
          {LANDING_PLANS.map((plan, index) => {
            const isPrimary = plan.id === 'pro';
            return (
              <AnimatedCard
                key={plan.id}
                delay={index * 70}
                dark={isPrimary}
                className={`flex flex-col p-6 h-full justify-between transition-all duration-300 ${
                  isPrimary ? 'border-t-4 border-t-primary shadow-md' : ''
                }`}
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between">
                      <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                        {plan.name}
                      </h3>
                      {isPrimary ? (
                        <span className="rounded-[4px] bg-primary/10 border border-primary px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider animate-pulse">
                          Recommended
                        </span>
                      ) : null}
                    </div>

                    {/* Price */}
                    <div className="relative z-10 mt-5">
                      <span className="text-4xl font-black tracking-tight text-foreground">
                        {plan.price}
                      </span>
                      <span
                        className={
                          isPrimary
                            ? 'ml-1.5 text-xs text-white/50 font-mono'
                            : 'ml-1.5 text-xs text-foreground/40 font-mono'
                        }
                      >
                        {plan.cadence === 'No payment required'
                          ? 'forever'
                          : `/ ${plan.cadence.replace('per ', '')}`}
                      </span>
                    </div>

                    {/* Audience */}
                    <p
                      className={`relative z-10 mt-3 text-[11px] leading-relaxed ${
                        isPrimary ? 'text-white/60' : 'text-muted-copy'
                      }`}
                    >
                      {plan.audience}
                    </p>

                    {/* Benefits */}
                    <ul className="relative z-10 mt-5 mb-8 space-y-2">
                      {plan.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className={
                            isPrimary
                              ? 'flex items-start gap-2 text-xs text-white/80'
                              : 'flex items-start gap-2 text-xs text-foreground/70'
                          }
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              isPrimary ? 'text-white/60' : 'text-primary'
                            }`}
                          />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/pricing"
                    className={
                      isPrimary
                        ? 'relative z-10 w-full rounded-[4px] bg-primary px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover'
                        : 'relative z-10 w-full rounded-[4px] border border-border-soft px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-copy transition hover:bg-surface-hover hover:text-foreground'
                    }
                  >
                    {plan.actionLabel}
                  </Link>
                </div>
              </AnimatedCard>
            );
          })}
        </div>

        {/* Link to full pricing */}
        <p className="mt-8 text-center text-xs text-muted-copy">
          Also available: Exec ($99/mo) and Private ($999/mo) plans.{' '}
          <Link
            to="/pricing"
            className="font-bold text-primary hover:underline"
          >
            See full pricing →
          </Link>
        </p>
      </div>
    </section>
  );
}
