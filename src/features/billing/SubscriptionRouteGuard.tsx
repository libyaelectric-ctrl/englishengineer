import { type ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { canAccessFeature } from './billing.entitlements';
import { useBillingStore } from './billing.store';
import type { BillingFeature } from './billing.types';

interface SubscriptionRouteGuardProps {
  /** The feature required to view the wrapped page. */
  feature: BillingFeature;
  children: ReactNode;
}

/**
 * Route-level entitlement guard. When the user's subscription does not
 * include `feature` (for example a free user visiting /reading), redirects
 * to the pricing page instead of rendering the locked content.
 */
export const SubscriptionRouteGuard = ({ feature, children }: SubscriptionRouteGuardProps) => {
  const subscription = useBillingStore((state) => state.subscription);
  const { allowed } = canAccessFeature(subscription, feature);

  if (!allowed) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};
