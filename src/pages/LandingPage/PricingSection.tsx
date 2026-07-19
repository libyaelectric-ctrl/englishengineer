import { Link } from 'react-router-dom';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Core modules', 'Vocabulary & grammar', '3 AI requests/day'],
    cta: 'Start free',
    primary: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    features: ['Unlimited AI feedback', 'Full A1-C2 access', 'Mistake log'],
    cta: 'Upgrade to Pro',
    primary: true,
  },
  {
    name: 'Project',
    price: '$39',
    period: '/mo',
    features: ['3 workspaces', 'Workspace memory', '20 docs/month'],
    cta: 'Upgrade to Project',
    primary: false,
  },
];

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
          {PLANS.map((plan, index) => (
            <AnimatedCard
              key={plan.name}
              delay={index * 70}
              dark={plan.primary}
              className={`flex flex-col p-6 h-full justify-between transition-all duration-300 ${
                plan.primary ? 'border-t-4 border-t-primary shadow-md' : ''
              }`}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className="text-base font-bold uppercase tracking-wider text-foreground">
                      {plan.name}
                    </h3>
                    {plan.primary ? (
                      <span className="rounded-[4px] bg-primary/10 border border-primary px-2 py-0.5 text-[9px] font-bold text-primary uppercase tracking-wider animate-pulse">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <div className="relative z-10 mt-5">
                    <span className="text-4xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span
                      className={
                        plan.primary
                          ? 'ml-1.5 text-xs text-white/50 font-mono'
                          : 'ml-1.5 text-xs text-foreground/40 font-mono'
                      }
                    >
                      {plan.period}
                    </span>
                  </div>
                  <ul className="relative z-10 mt-6 mb-8 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={
                          plan.primary
                            ? 'flex items-center gap-2 text-xs text-white/80'
                            : 'flex items-center gap-2 text-xs text-foreground/70'
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${plan.primary ? 'bg-white' : 'bg-primary'}`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/pricing"
                  className={
                    plan.primary
                      ? 'relative z-10 w-full rounded-[4px] bg-primary px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary-hover'
                      : 'relative z-10 w-full rounded-[4px] border border-border-soft px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-copy transition hover:bg-surface-hover hover:text-foreground'
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
