import { emptySubscription } from './billing-helpers.js';

export const handleCheckoutCompleted = async (repository, object) => {
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

export const handleSubscriptionUpdated = async (repository, object) => {
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

export const handlePaymentFailed = async (repository, object) => {
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

export const handleSubscriptionDeleted = async (repository, object) => {
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
