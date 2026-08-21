import { Check, Sparkles } from 'lucide-react';

import { getPricingCopy } from '@/shared/data/pricing-copy';
import type { PricingTier } from '@/shared/data/pricing.data';
import { formatPrice } from '@/shared/data/pricing.data';
import { type PricingTierId, getPublicPageCopy } from '@/shared/data/public-page-copy';

import { useLocalizationStore } from '@/features/localization';

import { getLandingTranslations } from '@/shared/data/landing-i18n';

interface PricingCardProps {
  tier: PricingTier;
  isAnnual: boolean;
  currency: string;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  variant?: 'landing' | 'pricing';
  onSelect?: (tierId: string) => void;
}

interface FeatureListProps {
  tier: PricingTier;
  isVariantLanding: boolean;
  featureLabels: Record<string, string | undefined>;
}

const FeatureList = ({ tier, isVariantLanding, featureLabels }: FeatureListProps) => {
  const excludedOverview =
    tier.features.some((f) => !f.included) && isVariantLanding
      ? tier.features
          .filter((feature) => !feature.included)
          .map((feature) => featureLabels[feature.name] ?? feature.name)
          .join(', ')
      : '';

  return (
    <div className="mt-4 space-y-2">
      {tier.features
        .filter((f) => f.included)
        .map((feature) => (
          <div key={feature.name} className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs text-foreground font-medium">
              {featureLabels[feature.name] ?? feature.name}
            </span>
          </div>
        ))}
      {excludedOverview && <p className="mt-3 text-[10px] text-muted-copy">{excludedOverview}</p>}
    </div>
  );
};

interface PricingCtaProps {
  tier: PricingTier;
  isTeam: boolean;
  isCurrentPlan: boolean;
  isLoading: boolean;
  onSelect?: (tierId: string) => void;
  copy: ReturnType<typeof getPricingCopy>;
  price: number;
  currency: string;
}

const PricingCta = ({
  tier,
  isTeam,
  isCurrentPlan,
  isLoading,
  onSelect,
  copy,
  price,
  currency,
}: PricingCtaProps) => {
  const handleClick = () => {
    if (tier.comingSoon || isLoading) return;
    onSelect?.(tier.id);
  };

  if (isTeam) {
    return (
      <a
        href="mailto:sales@engvox.io?subject=EngineerOS%20Team%20plan"
        className="block w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-surface-hover"
      >
        {copy.contactSales}
      </a>
    );
  }
  if (tier.comingSoon) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-xs font-bold text-muted-copy cursor-not-allowed"
      >
        {copy.comingSoon}
      </button>
    );
  }
  if (isCurrentPlan) {
    return (
      <span className="block w-full rounded-[var(--radius-card)] border border-success/30 bg-success/10 px-4 py-2.5 text-center text-xs font-bold text-success">
        {copy.currentPlan}
      </span>
    );
  }
  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="block w-full rounded-[var(--radius-card)] border border-border-soft bg-surface px-4 py-2.5 text-center text-xs font-bold text-muted-copy cursor-not-allowed"
      >
        {copy.loading}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full rounded-[var(--radius-card)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
        tier.popular
          ? 'bg-primary text-white hover:bg-primary/95'
          : 'bg-surface text-foreground border border-border-soft hover:bg-surface-hover'
      }`}
    >
      {onSelect ? `${copy.getStarted} - ${formatPrice(price, currency)}` : copy.choosePlan}
    </button>
  );
};

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
  const isVariantLanding = variant === 'landing';
  const isTeam = tier.id === 'team';
  const featureLabels: Record<string, string | undefined> = {
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
  };

  const cardClasses = isVariantLanding
    ? `relative flex h-full min-h-[560px] sm:min-h-[520px] flex-col justify-between rounded-[var(--radius-card)] p-5 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
        tier.popular ? 'border-2 border-primary shadow-xl' : 'border border-border-soft'
      }`
    : `relative flex h-full min-h-[680px] sm:min-h-[620px] flex-col justify-between rounded-[var(--radius-card)] p-4 bg-surface transition-all duration-300 hover:border-primary/40 shadow-sm ${
        tier.popular ? 'border-2 border-primary shadow-xl scale-[1.01]' : 'border border-soft'
      }`;

  return (
    <article className={cardClasses}>
      {tier.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 z-20">
          <Sparkles className="h-3 w-3" />
          {copy.mostPopular}
        </span>
      )}

      {tier.comingSoon && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md z-20">
          {copy.comingSoon}
        </span>
      )}

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="min-h-[52px]">
                <h3 className="text-lg font-extrabold text-foreground">{tier.name}</h3>
                <span className="text-[10px] font-mono font-bold text-muted-copy bg-surface-hover px-1.5 py-0.5 rounded">
                  {tier.accessBadge}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {isTeam ? '$$$$' : formatPrice(price, currency)}
            </span>
            <span className="text-xs text-muted-copy">
              {isAnnual ? copy.perMonthAnnual : copy.perMonth}
            </span>
          </div>

          <p className="text-xs text-muted-copy leading-relaxed min-h-[48px]">
            {publicCopy.tierDescriptions[tier.id as PricingTierId] ?? tier.description}
          </p>

          <FeatureList
            tier={tier}
            isVariantLanding={isVariantLanding}
            featureLabels={featureLabels}
          />
        </div>

        <div className="mt-4 pt-3 border-t border-border-soft">
          <PricingCta
            tier={tier}
            isTeam={isTeam}
            isCurrentPlan={isCurrentPlan}
            isLoading={isLoading}
            onSelect={onSelect}
            copy={copy}
            price={price}
            currency={currency}
          />
        </div>
      </div>
    </article>
  );
};

export default PricingCard;
