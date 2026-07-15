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
    <section className="border-t border-black/[0.06] px-6 py-12 md:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Pricing"
          title={<>Start free. Upgrade when ready.</>}
          align="center"
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <AnimatedCard
              key={plan.name}
              delay={index * 70}
              dark={plan.primary}
              className="flex min-h-[280px] flex-col p-6"
            >
              <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-base font-medium">{plan.name}</h3>
                {plan.primary ? (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-medium text-white/75">
                    Popular
                  </span>
                ) : null}
              </div>
              <div className="relative z-10 mt-5">
                <span className="text-3xl font-light">{plan.price}</span>
                <span
                  className={
                    plan.primary
                      ? 'ml-1.5 text-xs text-white/45'
                      : 'ml-1.5 text-xs text-black/42'
                  }
                >
                  {plan.period}
                </span>
              </div>
              <ul className="relative z-10 mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={
                      plan.primary
                        ? 'flex items-center gap-2 text-xs text-white/76'
                        : 'flex items-center gap-2 text-xs text-black/60'
                    }
                  >
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className={
                  plan.primary
                    ? 'relative z-10 mt-auto rounded-xl bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#111] transition hover:bg-white/90'
                    : 'relative z-10 mt-auto rounded-xl border border-black/10 px-4 py-2.5 text-center text-xs font-semibold text-black/60 transition hover:bg-black/[0.04] hover:text-black'
                }
              >
                {plan.cta}
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
