import { emptySubscription } from './billing-helpers.js';
import type { SubscriptionSnapshot } from './billing-helpers.js';
import { normalizePlanId } from './billing-plan-migration.js';

export interface WebhookObject {
  metadata?: Record<string, string>;
  client_reference_id?: string;
  customer?: string;
  subscription?: string;
  status?: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  id?: string;
  // Present on some Invoice payloads in newer Stripe API versions; mirrors
  // the metadata of the Subscription the invoice belongs to. Used as a
  // fallback when the invoice's own top-level metadata is empty.
  subscription_details?: { metadata?: Record<string, string> };
}

export interface BillingRepository {
  getSubscriptionStatus(userId: string): Promise<SubscriptionSnapshot | null>;
  upsertSubscriptionStatus(userId: string, snapshot: SubscriptionSnapshot): Promise<void>;
  hasStripeEventBeenProcessed(eventId: string): Promise<boolean>;
  markStripeEventProcessed(eventId: string, metadata?: Record<string, unknown>): Promise<void>;
}

const getUserId = (object: WebhookObject): string | null =>
  object.metadata?.userId ||
  object.client_reference_id ||
  object.subscription_details?.metadata?.userId ||
  null;

const buildCheckoutUpdate = (current: SubscriptionSnapshot, object: WebhookObject) => {
  const meta = object.metadata ?? {};
  // Top-ups and one-time purchases are credit transactions — they must never
  // grant an active (recurring) subscription. Only checkouts that represent a
  // real subscription may activate a plan.
  if (meta.type === 'topup' || meta.type === 'one_time' || !object.subscription) {
    const credits = (
      meta.type === 'topup' || meta.type === 'one_time'
        ? parseInt(meta.credits ?? '50', 10) || 0
        : 0
    ) as number;
    return {
      topupCredits: (current.topupCredits || 0) + credits,
    };
  }
  return {
    planId: normalizePlanId(meta.planId),
    status: 'active' as const,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    stripeCustomerId: object.customer ?? null,
    stripeSubscriptionId: object.subscription ?? null,
    topupCredits: current.topupCredits || 0,
  };
};

const buildSubscriptionUpdate = (
  current: SubscriptionSnapshot,
  object: WebhookObject,
  currentPeriodEnd: string | null
) => ({
  ...current,
  planId: normalizePlanId(object.metadata?.planId || current.planId),
  status: object.status || 'active',
  currentPeriodEnd: currentPeriodEnd || current.currentPeriodEnd,
  cancelAtPeriodEnd:
    typeof object.cancel_at_period_end === 'boolean'
      ? object.cancel_at_period_end
      : current.cancelAtPeriodEnd,
  stripeCustomerId: object.customer || current.stripeCustomerId,
  stripeSubscriptionId: object.id || current.stripeSubscriptionId,
  updatedAt: new Date().toISOString(),
  source: 'dodo_webhook',
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
  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    ...buildCheckoutUpdate(current, object),
    updatedAt: new Date().toISOString(),
    source: 'dodo_webhook',
  });
};

export const handleSubscriptionUpdated = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;
  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(
    userId,
    buildSubscriptionUpdate(current, object, parsePeriodEnd(object))
  );
};

const GRACE_PERIOD_DAYS = 3;

export const handlePaymentFailed = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;

  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();

  // If already in grace period, check if it has expired
  if (current.gracePeriodEndsAt) {
    const graceEnds = new Date(current.gracePeriodEndsAt);
    if (new Date() < graceEnds) {
      // Still within grace period — keep as-is with warning
      return;
    }
    // Grace period expired — now truly past_due
    await repository.upsertSubscriptionStatus(userId, {
      ...current,
      status: 'past_due',
      gracePeriodEndsAt: null,
      updatedAt: new Date().toISOString(),
      source: 'dodo_webhook',
    });
    return;
  }

  // First payment failure — start grace period
  const gracePeriodEndsAt = new Date();
  gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + GRACE_PERIOD_DAYS);

  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    status: 'past_due',
    gracePeriodEndsAt: gracePeriodEndsAt.toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'dodo_webhook',
  });
};

export const handleSubscriptionDeleted = async (
  repository: BillingRepository,
  object: WebhookObject
): Promise<void> => {
  const userId = getUserId(object);
  if (!userId) return;

  const current = (await repository.getSubscriptionStatus(userId)) ?? emptySubscription();
  await repository.upsertSubscriptionStatus(userId, {
    ...current,
    status: 'canceled',
    cancelAtPeriodEnd: false,
    updatedAt: new Date().toISOString(),
    source: 'dodo_webhook',
  });
};
