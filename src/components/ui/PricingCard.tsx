import { Check, Sparkles } from 'lucide-react';

import type { PricingTier } from '@/shared/data/pricing.data';
import { formatPrice } from '@/shared/data/pricing.data';

import { useLocalizationStore } from '@/features/localization';

interface PricingCardProps {
  tier: PricingTier;
  isAnnual: boolean;
  currency: string;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  variant?: 'landing' | 'pricing';
  onSelect?: (tierId: string) => void;
}

export const PricingCard = ({
  tier,
  isAnnual,
  currency,
  isCurrentPlan = false,
  isLoading = false,
  variant = 'pricing',
  onSelect,
}: PricingCardProps) => {
  const translate = useLocalizationStore((s) => s.translate);
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const isVariantLanding = variant === 'landing';

  const cardClasses = isVariantLanding
    ? `relative flex flex-col justify-between rounded-[var(--radius-card)] p-5 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
        tier.popular
          ? 'border-2 border-primary shadow-xl scale-[1.03]'
          : 'border border-border-soft'
      }`
    : `relative flex flex-col justify-between rounded-[var(--radius-card)] p-4 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
        tier.popular ? 'border-2 border-primary shadow-xl scale-[1.01]' : 'border border-soft'
      }`;

  const handleClick = () => {
    if (tier.comingSoon || isLoading) return;
    onSelect?.(tier.id);
  };

  return (
    <article className={cardClasses}>
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 z-20">
          <Sparkles className="h-3 w-3" />
          {translate('pricing.mostPopular') ?? 'Most Popular'}
        </span>
      )}

      {tier.comingSoon && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md z-20">
          {translate('pricing.comingSoon') ?? 'Coming Soon'}
        </span>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-extrabold text-foreground">{tier.name}</h3>
              <span className="text-[10px] font-mono font-bold text-muted-copy bg-surface-hover px-1.5 py-0.5 rounded">
                {tier.accessBadge}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {formatPrice(price, currency)}
            </span>
            <span className="text-xs text-muted-copy">
              {isAnnual
                ? (translate('pricing.perMonthAnnual') ?? '/mo (billed yearly)')
                : (translate('pricing.perMonth') ?? '/mo')}
            </span>
          </div>

          <p className="text-xs text-muted-copy leading-relaxed min-h-[32px]">{tier.description}</p>

          <div className="mt-4 space-y-2">
            {tier.features
              .filter((f) => f.included)
              .slice(0, isVariantLanding ? 6 : undefined)
              .map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="text-xs text-foreground font-medium">{feature.name}</span>
                </div>
              ))}
          </div>

          {tier.features.some((f) => !f.included) && isVariantLanding && (
            <p className="mt-3 text-[10px] text-muted-copy">{tier.notIncluded}</p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border-soft">
          {tier.comingSoon ? (
            <button
              type="button"
              disabled
              className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-xs font-bold text-muted-copy cursor-not-allowed"
            >
              {translate('pricing.comingSoon') ?? 'Coming Soon'}
            </button>
          ) : isCurrentPlan ? (
            <span className="block w-full rounded-[var(--radius-card)] border border-success/30 bg-success/10 px-4 py-2.5 text-center text-xs font-bold text-success">
              {translate('pricing.currentPlan') ?? 'Current plan'}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              disabled={isLoading}
              className={`w-full rounded-[var(--radius-card)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                tier.popular
                  ? 'bg-primary text-white hover:bg-primary/95'
                  : 'bg-surface text-foreground border border-border-soft hover:bg-surface-hover'
              }`}
            >
              {isLoading
                ? (translate('pricing.loading') ?? 'Loading...')
                : onSelect
                  ? `${translate('pricing.getStarted') ?? 'Get Started'} - ${formatPrice(price, currency)}`
                  : (translate('pricing.choosePlan') ?? 'Choose Plan')}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PricingCard;
