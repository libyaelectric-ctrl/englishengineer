import { Check, Sparkles } from 'lucide-react';

import { getPricingCopy } from '@/shared/data/pricing-copy';
import type { PricingTier } from '@/shared/data/pricing.data';
import { formatPrice } from '@/shared/data/pricing.data';
import { type PricingTierId, getPublicPageCopy } from '@/shared/data/public-page-copy';
import { getLandingTranslations } from '@/shared/i18n/landing-i18n';

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

const FeatureList = ({
  tier,
  featureLabels,
  compact,
}: {
  tier: PricingTier;
  featureLabels: Record<string, string | undefined>;
  compact: boolean;
}) => {
  const included = tier.features.filter((f) => f.included);
  const visible = compact ? included.slice(0, 6) : included;
  const hiddenCount = included.length - visible.length;
  return (
    <div className={compact ? 'mt-2 space-y-1.5' : 'mt-4 space-y-2'}>
      {visible.map((feature) => (
        <div key={feature.name} className="flex items-center gap-2">
          <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span
            className={
              compact
                ? 'text-sm font-semibold leading-6 text-foreground'
                : 'text-sm font-medium leading-6 text-foreground'
            }
          >
            {featureLabels[feature.name] ?? feature.name}
          </span>
        </div>
      ))}
      {hiddenCount > 0 && (
        <p className="text-[10px] font-bold text-muted-copy">+{hiddenCount} more</p>
      )}
    </div>
  );
};

const PricingCta = ({
  tier,
  isTeam,
  isCurrentPlan,
  isLoading,
  onSelect,
  copy,
  price,
  currency,
  compact,
}: {
  tier: PricingTier;
  isTeam: boolean;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSelect?: (tierId: string) => void;
  copy: ReturnType<typeof getPricingCopy>;
  price: number;
  currency: string;
  compact: boolean;
}) => {
  const handleClick = () => {
    if (tier.comingSoon || isLoading) return;
    onSelect?.(tier.id);
  };
  const btnClass = `${compact ? 'py-3 text-xs' : 'py-3 text-sm'} min-h-11 w-full rounded-[var(--radius-card)] px-3 font-bold transition-colors shadow-sm`;
  if (isTeam)
    return (
      <button
        type="button"
        onClick={async () => {
          const { openMailto } = await import('@/shared/utils/capacitor');
          await openMailto('sales@engvox.io', 'EngVox Team plan', '');
        }}
        className={`${btnClass} border border-border-soft bg-surface text-foreground hover:bg-surface-hover cursor-pointer`}
      >
        {copy.contactSales}
      </button>
    );
  if (tier.comingSoon)
    return (
      <button
        type="button"
        disabled
        className={`${btnClass} border border-border-soft bg-surface text-muted-copy cursor-not-allowed`}
      >
        {copy.comingSoon}
      </button>
    );
  if (isCurrentPlan)
    return (
      <span
        className={`${btnClass} block border border-success/30 bg-success/10 text-center text-success`}
      >
        {copy.currentPlan}
      </span>
    );
  if (isLoading)
    return (
      <button
        type="button"
        disabled
        className={`${btnClass} border border-border-soft bg-surface text-muted-copy cursor-not-allowed`}
      >
        {copy.loading}
      </button>
    );
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${btnClass} ${tier.popular ? 'bg-primary text-primary-foreground hover:bg-primary/95' : 'border border-border-soft bg-surface text-foreground hover:bg-surface-hover'}`}
    >
      {onSelect ? `${copy.getStarted} - ${formatPrice(price, currency)}` : copy.choosePlan}
    </button>
  );
};

const getFeatureLabels = (
  landingCopy: ReturnType<typeof getLandingTranslations>
): Record<string, string | undefined> => ({
  'Placement Test': landingCopy.placementTest,
  'Learning Hub': landingCopy.learningHub,
  'Progress Tracking': landingCopy.progress,
  Vocabulary: landingCopy.vocabularyPricing,
  Grammar: landingCopy.grammarPricing,
  Translator: landingCopy.translator,
  Reading: landingCopy.readingPricing,
  Writing: landingCopy.writingPricing,
  Speaking: landingCopy.speakingPricing,
  Listening: landingCopy.listening,
  Tool: landingCopy.tool,
  'AI Copilot': landingCopy.aiCopilot,
});

const getCardClasses = (compact: boolean, popular: boolean): string => {
  const base =
    'relative flex h-full flex-col rounded-[var(--radius-card)] p-4 bg-surface transition-colors duration-200 shadow-sm';
  const desktop =
    'relative flex h-full min-h-[520px] flex-col justify-between rounded-[var(--radius-card)] p-5 bg-surface transition-all duration-300 shadow-sm';
  const border = popular ? 'border-2 border-primary shadow-lg' : 'border border-border-soft';
  return compact
    ? `${base} ${border}`
    : `${desktop} ${popular ? 'border-2 border-primary shadow-xl' : 'border border-border-soft'}`;
};

const PriceDisplay = ({
  tier,
  price,
  currency,
  isAnnual,
  isTeam,
  compact,
  copy,
}: {
  tier: PricingTier;
  price: number;
  currency: string;
  isAnnual: boolean;
  isTeam: boolean;
  compact: boolean;
  copy: ReturnType<typeof getPricingCopy>;
}) => {
  const hasOriginalPrice = tier.originalMonthlyPrice || tier.originalAnnualPrice;
  const originalPrice = isAnnual
    ? (tier.originalAnnualPrice ?? tier.originalMonthlyPrice ?? price)
    : (tier.originalMonthlyPrice ?? price);

  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-baseline gap-1.5">
        {hasOriginalPrice && (
          <span className="font-mono text-xs text-muted-copy/60 line-through">
            {isTeam ? '$$$$' : formatPrice(originalPrice, currency)}
          </span>
        )}
        <span
          className={
            compact
              ? 'font-mono text-2xl font-extrabold tracking-tight text-foreground'
              : 'font-mono text-3xl font-extrabold tracking-tight text-foreground'
          }
        >
          {isTeam ? '$$$$' : formatPrice(price, currency)}
        </span>
        <span className="text-xs text-muted-copy">
          {isAnnual && price > 0 ? copy.perMonthAnnual : copy.perMonth}
        </span>
      </div>
    </div>
  );
};

const getCheckoutPrice = (tier: PricingTier, isAnnual: boolean): number =>
  isAnnual ? (tier.annualTotal ?? Math.round(tier.annualPrice * 1200) / 100) : tier.monthlyPrice;

export const PricingCard = ({
  tier,
  isAnnual,
  currency,
  isCurrentPlan = false,
  isLoading = false,
  variant = 'pricing',
  onSelect,
}: PricingCardProps) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = getPricingCopy(language);
  const publicCopy = getPublicPageCopy(language);
  const landingCopy = getLandingTranslations(language);
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const compact = variant === 'pricing';
  const isTeam = tier.id === 'team';
  const featureLabels = getFeatureLabels(landingCopy);
  const cardClasses = getCardClasses(compact, tier.popular);

  return (
    <article className={cardClasses}>
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-primary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
          <Sparkles className="h-3 w-3" />
          {copy.mostPopular}
        </span>
      )}
      <div className="relative z-10 flex flex-1 flex-col gap-4">
        <div>
          <div className={compact ? 'mb-2 min-h-[38px]' : 'mb-3 min-h-[52px]'}>
            <h3
              className={
                compact
                  ? 'text-base font-extrabold text-foreground'
                  : 'text-lg font-extrabold text-foreground'
              }
            >
              {tier.name}
            </h3>
            <span className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-copy">
              {tier.accessBadge}
            </span>
          </div>
          <PriceDisplay
            tier={tier}
            price={price}
            currency={currency}
            isAnnual={isAnnual}
            isTeam={isTeam}
            compact={compact}
            copy={copy}
          />
          <p
            className={
              compact
                ? 'min-h-[40px] text-sm leading-6 text-muted-copy'
                : 'min-h-[48px] text-xs leading-relaxed text-muted-copy'
            }
          >
            {publicCopy.tierDescriptions[tier.id as PricingTierId] ?? tier.description}
          </p>
          <FeatureList tier={tier} featureLabels={featureLabels} compact={compact} />
        </div>
        <div
          className={
            compact
              ? 'mt-auto border-t border-border-soft pt-3'
              : 'mt-4 border-t border-border-soft pt-3'
          }
        >
          <PricingCta
            tier={tier}
            isTeam={isTeam}
            isCurrentPlan={isCurrentPlan}
            isLoading={isLoading}
            onSelect={onSelect}
            copy={copy}
            price={getCheckoutPrice(tier, isAnnual)}
            currency={currency}
            compact={compact}
          />
          {isAnnual && price > 0 && !isTeam && (
            <p className="mt-2 text-center text-xs text-muted-copy">
              {copy.annual}: {formatPrice(getCheckoutPrice(tier, isAnnual), currency)} USD
            </p>
          )}
        </div>
      </div>
    </article>
  );
};
export default PricingCard;
