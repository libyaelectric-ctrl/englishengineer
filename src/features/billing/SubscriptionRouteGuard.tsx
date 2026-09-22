import { type ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { LoadingState } from '@/shared/components/LoadingState';

import { useAuthStore } from '@/features/auth';

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
  const isLoading = useBillingStore((state) => state.isLoading);
  const initializedUserId = useBillingStore((state) => state.initializedUserId);
  const syncError = useBillingStore((state) => state.syncError);
  const lastSyncedAt = useBillingStore((state) => state.lastSyncedAt);
  const userId = useAuthStore((state) => state.currentUser?.id);
  const requiresSync = userId && !userId.startsWith('demo_');
  const { allowed } = canAccessFeature(subscription, feature);
  const { limited } = getFreeTierPreview(subscription, feature);

  if (requiresSync && (initializedUserId !== userId || (isLoading && !lastSyncedAt)))
    return <LoadingState title="Checking your subscription" />;
  if (requiresSync && syncError && !lastSyncedAt)
    return (
      <div role="alert">
        <p>{syncError}</p>
        <button
          className="min-h-11 text-primary underline"
          onClick={() => void useBillingStore.getState().refreshBilling(userId)}
        >
          Retry
        </button>
      </div>
    );
  if (!allowed && !limited) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};
