import { emptySubscription } from './billing-helpers.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';

interface WebhookObject {
  metadata?: Record<string, string>;
  client_reference_id?: string;
  customer?: string;
  subscription?: string;
  status?: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  id?: string;
}

export interface BillingRepository {
  getSubscriptionStatus(userId: string): Promise<SubscriptionSnapshot | null>;
  upsertSubscriptionStatus(
    userId: string,
    snapshot: SubscriptionSnapshot
  ): Promise<void>;
  hasStripeEventBeenProcessed(eventId: string): Promise<boolean>;
  markStripeEventProcessed(
    eventId: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

export const handleCheckoutCompleted = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = object.metadata?.userId || object.client_reference_id;
  if (!userId) return;

  if (object.metadata?.type === 'topup') {
    const credits = parseInt(object.metadata?.credits || '50', 10);
    const current =
      (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
    await repository.upsertSubscriptionStatus(userId, {
      ...current,
      topupCredits: (current.topupCredits || 0) + credits,
      updatedAt: new Date().toISOString(),
      source: 'stripe_webhook',
    });
  } else {
    const current =
      (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
    await repository.upsertSubscriptionStatus(userId, {
      planId: object.metadata?.planId || 'pro',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: object.customer || null,
      stripeSubscriptionId: object.subscription || null,
      updatedAt: new Date().toISOString(),
      source: 'stripe_webhook',
      topupCredits: current.topupCredits || 0,
    });
  }
};

export const handleSubscriptionUpdated = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = object.metadata?.userId || object.client_reference_id;
  if (!userId) return;

  const current =
    (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  const periodEndSec = object.current_period_end;
  const currentPeriodEnd =
    typeof periodEndSec === 'number' && periodEndSec > 0
      ? new Date(periodEndSec * 1000).toISOString()
      : null;

  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    planId: object.metadata?.planId || current.planId || 'pro',
    status: object.status || 'active',
    currentPeriodEnd: currentPeriodEnd || current.currentPeriodEnd,
    cancelAtPeriodEnd:
      typeof object.cancel_at_period_end === 'boolean'
        ? object.cancel_at_period_end
        : current.cancelAtPeriodEnd,
    stripeCustomerId: object.customer || current.stripeCustomerId,
    stripeSubscriptionId: object.id || current.stripeSubscriptionId,
    updatedAt: new Date().toISOString(),
    source: 'stripe_webhook',
  });
};

export const handlePaymentFailed = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = object.metadata?.userId || object.client_reference_id;
  if (!userId) return;

  const current =
    (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    status: 'past_due',
    updatedAt: new Date().toISOString(),
    source: 'stripe_webhook',
  });
};

export const handleSubscriptionDeleted = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = object.metadata?.userId || object.client_reference_id;
  if (!userId) return;

  const current =
    (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    status: 'canceled',
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
    source: 'stripe_webhook',
  });
};
