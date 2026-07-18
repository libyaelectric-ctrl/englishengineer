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

const getUserId = (object: WebhookObject): string | null =>
  object.metadata?.userId || object.client_reference_id || null;

const buildCheckoutUpdate = (current: SubscriptionSnapshot, object: WebhookObject) => {
  const meta = object.metadata ?? {};
  if (meta.type === 'topup') return { topupCredits: (current.topupCredits || 0) + parseInt(meta.credits ?? '50', 10) };
  return { planId: meta.planId ?? 'pro', status: 'active' as const, currentPeriodEnd: null, cancelAtPeriodEnd: false, stripeCustomerId: object.customer ?? null, stripeSubscriptionId: object.subscription ?? null, topupCredits: current.topupCredits || 0 };
};

const buildSubscriptionUpdate = (current: SubscriptionSnapshot, object: WebhookObject, currentPeriodEnd: string | null) => ({
  ...current,
  planId: object.metadata?.planId || current.planId || 'pro',
  status: object.status || 'active',
  currentPeriodEnd: currentPeriodEnd || current.currentPeriodEnd,
  cancelAtPeriodEnd: typeof object.cancel_at_period_end === 'boolean' ? object.cancel_at_period_end : current.cancelAtPeriodEnd,
  stripeCustomerId: object.customer || current.stripeCustomerId,
  stripeSubscriptionId: object.id || current.stripeSubscriptionId,
  updatedAt: new Date().toISOString(),
  source: 'stripe_webhook',
});

const parsePeriodEnd = (object: WebhookObject): string | null => {
  const sec = object.current_period_end;
  return typeof sec === 'number' && sec > 0 ? new Date(sec * 1000).toISOString() : null;
};

export const handleCheckoutCompleted = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;
  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, { ...current, ...buildCheckoutUpdate(current, object), updatedAt: new Date().toISOString(), source: 'stripe_webhook' });
};

export const handleSubscriptionUpdated = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;
  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, buildSubscriptionUpdate(current, object, parsePeriodEnd(object)));
};

export const handlePaymentFailed = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;

  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, { ...current, status: 'past_due', updatedAt: new Date().toISOString(), source: 'stripe_webhook' });
};

export const handleSubscriptionDeleted = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;

  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, { ...current, status: 'canceled', cancelAtPeriodEnd: false, updatedAt: new Date().toISOString(), source: 'stripe_webhook' });
};
