import { type ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { canAccessFeature, getFreeTierPreview } from './billing.entitlements';
import { useBillingStore } from './billing.store';
import type { BillingFeature } from './billing.types';

interface SubscriptionRouteGuardProps {
  /** The feature required to view the wrapped page. */
  feature: BillingFeature;
  children: ReactNode;
}

/**
 * Route-level entitlement guard — the single place that decides whether a
 * user may be on a route. When the subscription does not include `feature`
 * (for example a free user visiting /reading), redirects to the pricing
 * page. Features with a free-tier preview (Grammar first module,
 * Vocabulary first page) are NOT full locks: the user enters the route and
 * the page enforces the partial limit via `getFreeTierPreview`.
 */
export const SubscriptionRouteGuard = ({ feature, children }: SubscriptionRouteGuardProps) => {
  const subscription = useBillingStore((state) => state.subscription);
  const { allowed } = canAccessFeature(subscription, feature);
  const { limited } = getFreeTierPreview(subscription, feature);

  if (!allowed && !limited) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};
