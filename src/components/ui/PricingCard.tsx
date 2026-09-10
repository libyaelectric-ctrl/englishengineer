/* eslint-disable complexity */
import { Check, Sparkles } from 'lucide-react';

import { getPricingCopy } from '@/shared/data/pricing-copy';
import type { PricingTier } from '@/shared/data/pricing.data';
import { formatPrice } from '@/shared/data/pricing.data';
import { type PricingTierId, getPublicPageCopy } from '@/shared/data/public-page-copy';
import { getLandingTranslations } from '@/shared/i18n/landing-i18n';

import { useLocalizationStore } from '@/features/localization';

interface PricingCardProps { tier: PricingTier; isAnnual: boolean; currency: string; isCurrentPlan?: boolean; isLoading?: boolean; variant?: 'landing' | 'pricing'; onSelect?: (tierId: string) => void; }

const FeatureList = ({ tier, featureLabels, compact }: { tier: PricingTier; featureLabels: Record<string, string | undefined>; compact: boolean }) => {
  const included = tier.features.filter((f) => f.included);
  const visible = compact ? included.slice(0, 6) : included;
  const hiddenCount = included.length - visible.length;
  return (
    <div className={compact ? 'mt-2 space-y-1.5' : 'mt-4 space-y-2'}>
      {visible.map((feature) => (<div key={feature.name} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-primary" /><span className={compact ? 'truncate text-[11px] font-semibold text-foreground' : 'text-xs font-medium text-foreground'}>{featureLabels[feature.name] ?? feature.name}</span></div>))}
      {hiddenCount > 0 && <p className="text-[10px] font-bold text-muted-copy">+{hiddenCount} more</p>}
    </div>
  );
};

const PricingCta = ({ tier, isTeam, isCurrentPlan, isLoading, onSelect, copy, price, currency, compact }: { tier: PricingTier; isTeam: boolean; isCurrentPlan: boolean; isLoading: boolean; onSelect?: (tierId: string) => void; copy: ReturnType<typeof getPricingCopy>; price: number; currency: string; compact: boolean }) => {
  const handleClick = () => { if (tier.comingSoon || isLoading) return; onSelect?.(tier.id); };
  const btnClass = `${compact ? 'py-2 text-[10px]' : 'py-2.5 text-xs'} w-full rounded-[var(--radius-card)] px-3 font-bold uppercase tracking-wider transition-all shadow-sm`;
  if (isTeam) return <button type="button" onClick={async () => { const { openMailto } = await import('@/shared/utils/capacitor'); await openMailto('sales@engvox.io', 'EngVox Team plan', ''); }} className={`${btnClass} border border-border-soft bg-surface text-foreground hover:bg-surface-hover cursor-pointer`}>{copy.contactSales}</button>;
  if (tier.comingSoon) return <button type="button" disabled className={`${btnClass} border border-border-soft bg-surface text-muted-copy cursor-not-allowed`}>{copy.comingSoon}</button>;
  if (isCurrentPlan) return <span className={`${btnClass} block border border-success/30 bg-success/10 text-center text-success`}>{copy.currentPlan}</span>;
  if (isLoading) return <button type="button" disabled className={`${btnClass} border border-border-soft bg-surface text-muted-copy cursor-not-allowed`}>{copy.loading}</button>;
  return <button type="button" onClick={handleClick} className={`${btnClass} ${tier.popular ? 'bg-primary text-white hover:bg-primary/95' : 'border border-border-soft bg-surface text-foreground hover:bg-surface-hover'}`}>{onSelect ? `${copy.getStarted} - ${formatPrice(price, currency)}` : copy.choosePlan}</button>;
};

export const PricingCard = ({ tier, isAnnual, currency, isCurrentPlan = false, isLoading = false, variant = 'pricing', onSelect }: PricingCardProps) => {
  const language = useLocalizationStore((s) => s.language);
  const copy = getPricingCopy(language);
  const publicCopy = getPublicPageCopy(language);
  const landingCopy = getLandingTranslations(language);
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const compact = variant === 'pricing';
  const isTeam = tier.id === 'team';
  const featureLabels: Record<string, string | undefined> = { 'Placement Test': landingCopy.placementTest, 'Learning Hub': landingCopy.learningHub, 'Progress Tracking': landingCopy.progress, Vocabulary: landingCopy.vocabularyPricing, Grammar: landingCopy.grammarPricing, Translator: landingCopy.translator, Reading: landingCopy.readingPricing, Writing: landingCopy.writingPricing, Speaking: landingCopy.speakingPricing, Listening: landingCopy.listening, Tool: landingCopy.tool, 'AI Copilot': landingCopy.aiCopilot };
  const cardClasses = compact ? `relative flex h-full min-h-0 flex-col justify-between rounded-[1.25rem] p-3 bg-surface transition-all duration-300 shadow-sm ${tier.popular ? 'border-2 border-primary shadow-lg' : 'border border-border-soft'}` : `relative flex h-full min-h-[520px] flex-col justify-between rounded-[var(--radius-card)] p-5 bg-surface transition-all duration-300 shadow-sm ${tier.popular ? 'border-2 border-primary shadow-xl' : 'border border-border-soft'}`;
  return (
    <article className={cardClasses}>
      {tier.popular && <span className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-primary px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-md"><Sparkles className="h-3 w-3" />{copy.mostPopular}</span>}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="min-h-0">
          <div className={compact ? 'mb-2 min-h-[38px]' : 'mb-3 min-h-[52px]'}><h3 className={compact ? 'text-base font-extrabold text-foreground' : 'text-lg font-extrabold text-foreground'}>{tier.name}</h3><span className="rounded bg-surface-hover px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-copy">{tier.accessBadge}</span></div>
          <div className="mb-2"><div className="flex flex-wrap items-baseline gap-1.5">{tier.originalMonthlyPrice || tier.originalAnnualPrice ? <span className="font-mono text-xs text-muted-copy/60 line-through">{isTeam ? '$$$$' : formatPrice(isAnnual ? (tier.originalAnnualPrice ?? tier.originalMonthlyPrice ?? price) : (tier.originalMonthlyPrice ?? price), currency)}</span> : null}<span className={compact ? 'font-mono text-2xl font-extrabold tracking-tight text-foreground' : 'font-mono text-3xl font-extrabold tracking-tight text-foreground'}>{isTeam ? '$$$$' : formatPrice(price, currency)}</span><span className="text-[11px] text-muted-copy">{copy.perMonth}</span></div></div>
          <p className={compact ? 'line-clamp-2 min-h-[36px] text-[11px] leading-5 text-muted-copy' : 'min-h-[48px] text-xs leading-relaxed text-muted-copy'}>{publicCopy.tierDescriptions[tier.id as PricingTierId] ?? tier.description}</p>
          <FeatureList tier={tier} featureLabels={featureLabels} compact={compact} />
        </div>
        <div className={compact ? 'mt-2 border-t border-border-soft pt-2' : 'mt-4 border-t border-border-soft pt-3'}><PricingCta tier={tier} isTeam={isTeam} isCurrentPlan={isCurrentPlan} isLoading={isLoading} onSelect={onSelect} copy={copy} price={price} currency={currency} compact={compact} /></div>
      </div>
    </article>
  );
};
export default PricingCard;
