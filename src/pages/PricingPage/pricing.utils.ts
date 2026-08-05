import { COMMERCIAL_PLAN_CATALOG, CommercialPlanPreview } from '@/features/billing';
import { CurrencyConfig } from '@/features/billing/currency.config';

import { ACCESS_BADGES, BASE_USD_MAP } from './pricing.constants';

export const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const isPlanUnavailable = (plan: CommercialPlanPreview) =>
  plan.id === 'master' || plan.id === 'team';

export const getAccessBadge = (id: string): string => ACCESS_BADGES[id] ?? 'ACCESS-LVL-01';

export const getCalculatedPrice = (
  plan: CommercialPlanPreview,
  isAnnual: boolean,
  currencyCode = 'USD'
): string => {
  if (plan.id === 'junior') return CurrencyConfig.formatPrice(0, currencyCode);
  const p = BASE_USD_MAP[plan.id] || { monthly: 29, annual: 23 };
  const usd = isAnnual ? p.annual : p.monthly;
  return CurrencyConfig.formatPrice(usd, currencyCode);
};

export const getPlanActionLabel = ({
  planId,
  isCurrent,
  inProgress,
  isUnavailable,
}: {
  planId: string;
  isCurrent: boolean;
  inProgress: boolean;
  isUnavailable: boolean;
}): string => {
  if (isUnavailable) return 'Contact Sales';
  if (isCurrent) return 'Current plan';
  if (inProgress) return 'Loading...';
  const plan = COMMERCIAL_PLAN_CATALOG.find((p) => p.id === planId);
  return `Upgrade to ${plan?.name ?? planId}`;
};

export const getPlanActionStyle = ({
  isUnavailable,
  isCurrent,
}: {
  isUnavailable: boolean;
  isCurrent: boolean;
}): string => {
  if (isUnavailable) {
    return 'border border-border-soft bg-surface text-muted-copy cursor-not-allowed opacity-60';
  }
  if (isCurrent) {
    return 'border border-success/30 bg-success/10 text-success cursor-not-allowed';
  }
  return 'bg-primary text-white hover:bg-primary/95';
};
