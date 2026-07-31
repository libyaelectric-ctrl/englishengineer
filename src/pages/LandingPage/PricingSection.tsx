import { CheckCircle2, Globe, Sparkles } from 'lucide-react';

import { useState } from 'react';

import { Link } from 'react-router-dom';

import { COMMERCIAL_PLAN_CATALOG, CurrencyConfig } from '@/features/billing';

import { AnimatedCard } from './AnimatedComponents';
import { PricingAddonsCard } from './PricingAddonsCard';
import { SalesChatModal } from './SalesChatModal';

const LANDING_PLANS = COMMERCIAL_PLAN_CATALOG.filter((p) =>
  ['free', 'pro', 'project'].includes(p.id)
);

const BASE_USD_PRICES: Record<string, number> = {
  free: 0,
  pro: 29,
  project: 59,
};

interface PricingPlanCardProps {
  plan: (typeof LANDING_PLANS)[number];
  index: number;
  isPrimary: boolean;
  basePrice: number;
  discountedPrice?: number;
  displayPrice: string;
  isAnnual: boolean;
}

function PricingPlanCard({
  plan,
  index,
  isPrimary,
  basePrice: _basePrice,
  displayPrice,
  isAnnual,
}: PricingPlanCardProps) {
  return (
    <AnimatedCard
      delay={index * 50}
      className={`flex flex-col p-5 h-full justify-between transition-all duration-300 rounded-xl relative ${
        isPrimary
          ? 'border-2 border-primary shadow-2xl bg-surface scale-[1.02] light-sweep-container overflow-hidden'
          : 'border border-border-soft bg-surface'
      }`}
    >
      {isPrimary && (
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-400 via-primary to-indigo-600 blur-lg opacity-60 animate-spin-slow pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              {plan.name}
              {isPrimary && <Sparkles className="h-4 w-4 text-amber-500 animate-bounce" />}
            </h3>
            {isPrimary ? (
              <span className="rounded bg-gradient-to-r from-amber-500 to-primary text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-md">
                Most Popular
              </span>
            ) : null}
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {displayPrice}
            </span>
            <span className="text-xs text-muted-copy font-medium">
              {plan.id === 'free' ? '' : isAnnual ? '/month (billed annually)' : '/month'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted-copy min-h-[32px]">{plan.priceReason}</p>

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
                ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md'
                : 'bg-background text-foreground border border-border-soft hover:bg-surface-hover'
            }`}
          >
            {plan.id === 'free' ? 'Start Free' : 'Get Started'}
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function PricingSection() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="border-t border-border-soft bg-background px-6 py-8 md:px-12 md:py-12 relative"
    >
      <div className="mx-auto max-w-7xl">
        {/* Single Row Compact Header with Multi-Currency Selector (Item 15) */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded bg-soft border border-border-soft px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Pricing & Plans
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Start free. Upgrade when ready.
            </h2>
          </div>

          {/* ITEM 15: Global Currency & Region Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Annual Toggle with Savings Badge */}
            <div className="flex items-center gap-2 bg-surface p-1 rounded-lg border border-border-soft text-xs font-bold">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  !isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                  isAnnual ? 'bg-primary text-white shadow-sm' : 'text-muted-copy'
                }`}
              >
                <span>Annual</span>
                <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-mono">
                  -20%
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border-soft text-xs font-bold">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {CurrencyConfig.CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-background text-foreground">
                    {c.flag} {c.code} ({c.symbol}) — {c.region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Compact 3-Tier Grid with ITEM 16 Border-Beam Halo */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 items-stretch">
          {LANDING_PLANS.map((plan, index) => {
            const isPrimary = plan.id === 'pro';
            const basePrice = BASE_USD_PRICES[plan.id] || 0;
            const discountedPrice = isAnnual ? Math.round(basePrice * 0.8) : basePrice;
            const displayPrice = CurrencyConfig.formatPrice(discountedPrice, selectedCurrency);

            return (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                index={index}
                isPrimary={isPrimary}
                basePrice={basePrice}
                discountedPrice={discountedPrice}
                displayPrice={displayPrice}
                isAnnual={isAnnual}
              />
            );
          })}
        </div>

        {/* ITEM 17: Micro-Transaction Add-ons */}
        <PricingAddonsCard />
      </div>

      {/* ITEM 20: Sales Chat Trigger & Modal */}
      <SalesChatModal />
    </section>
  );
}

export default PricingSection;
