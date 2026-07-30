import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { COMMERCIAL_PLAN_CATALOG } from '@/features/billing';
import { AnimatedCard, SectionIntro } from './AnimatedComponents';

const LANDING_PLANS = COMMERCIAL_PLAN_CATALOG.filter(p => ['free','pro','project'].includes(p.id));

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border-soft bg-background px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Pricing" title={<>Start free. Upgrade when ready.</>} align="center" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
          {LANDING_PLANS.map((plan, index) => {
            const isPrimary = plan.id === 'pro';
            return (
              <AnimatedCard key={plan.id} delay={index * 70} className={`flex flex-col p-6 h-full justify-between transition-all duration-300 rounded ${isPrimary ? 'border-2 border-primary shadow-md bg-surface' : 'border border-border-soft bg-surface'}`}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="relative z-10 flex items-center justify-between">
                      <h3 className="text-base font-bold uppercase tracking-wider text-foreground">{plan.name}</h3>
                      {isPrimary ? <span className="rounded bg-soft border border-primary px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">Popular</span> : null}
                    </div>
                    <div className="relative z-10 mt-5">
                      <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
                      <span className="ml-1.5 text-xs text-muted-copy font-mono">{plan.cadence || ''}</span>
                    </div>
                    <p className="relative z-10 mt-3 text-sm leading-relaxed text-muted-copy">{plan.priceReason}</p>
                    <ul className="relative z-10 mt-6 space-y-3">
                      {plan.benefits.map((f: string) => (
                        <li key={f} className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-foreground">{f}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative z-10 mt-8">
                    <Link to="/signup" className={`block w-full rounded px-4 py-3 text-center text-sm font-semibold transition-colors ${isPrimary ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : 'bg-background text-foreground border border-border-soft hover:bg-surface-hover'}`}>{plan.id === 'free' ? 'Start Free' : 'Get Started'}</Link>
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
