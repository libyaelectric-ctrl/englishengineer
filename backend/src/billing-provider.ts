import type { BillingProviderName } from '../types.js';
import type { BillingRepository, WebhookObject } from './billing-webhook-handlers.js';
import {
  handleCheckoutCompleted,
  handlePaymentFailed,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from './billing-webhook-handlers.js';

export type { BillingProviderName };

export interface BillingCheckoutBody {
  email: string;
  successUrl: string;
  cancelUrl: string;
  planId: string;
  billingInterval?: 'month' | 'year';
}

export interface BillingTopupBody {
  email: string;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingPortalBody {
  returnUrl: string;
}

export interface WebhookProcessingResult {
  received: boolean;
  duplicate: boolean;
  eventId: string;
}

export interface WebhookRoute {
  path: string;
  signatureHeaders: string[];
}

/**
 * A payment provider adapter (Stripe, Dodo, Paddle, ...).
 *
 * Providers are intentionally Stripe-shaped so the checkout -> webhook ->
 * repository flow stays identical no matter which merchant of record is
 * active. The webhook handler normalizes provider payloads before calling
 * the shared dispatch below.
 */
export interface BillingProvider {
  readonly name: BillingProviderName;
  readonly configured: boolean;
  readonly webhookRoutes: ReadonlyArray<WebhookRoute>;
  createCheckoutSession(userId: string, body: BillingCheckoutBody): Promise<{ url: string }>;
  createTopupCheckoutSession(userId: string, body: BillingTopupBody): Promise<{ url: string }>;
  createPortalSession(customerId: string, body: BillingPortalBody): Promise<{ url: string }>;
  processWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>,
    onEventDetected?: (step: string, eventId: string, eventType: string) => void
  ): Promise<WebhookProcessingResult>;
}

export interface NormalizedWebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

/**
 * Dispatches a normalized webhook event to the subscription repository
 * handlers. Unknown event types are acknowledged without side effects.
 */
export const dispatchWebhookEvent = async (
  repository: BillingRepository,
  eventType: string,
  object: Record<string, unknown>
): Promise<void> => {
  const webhookObject = object as WebhookObject;
  if (eventType === 'checkout.session.completed') {
    await handleCheckoutCompleted(repository, webhookObject);
  } else if (
    eventType === 'customer.subscription.created' ||
    eventType === 'customer.subscription.updated'
  ) {
    await handleSubscriptionUpdated(repository, webhookObject);
  } else if (eventType === 'invoice.payment_failed') {
    await handlePaymentFailed(repository, webhookObject);
  } else if (eventType === 'customer.subscription.deleted') {
    await handleSubscriptionDeleted(repository, webhookObject);
  }
};

/**
 * Applies idempotency (provider webhook id) and dispatches the event.
 */
export const processNormalizedWebhookEvent = async (
  repository: BillingRepository,
  event: NormalizedWebhookEvent
): Promise<WebhookProcessingResult> => {
  if (await repository.hasStripeEventBeenProcessed(event.id)) {
    return { received: true, duplicate: true, eventId: event.id };
  }
  await dispatchWebhookEvent(repository, event.type, event.data);
  await repository.markStripeEventProcessed(event.id, {
    type: event.type,
    processedAt: new Date().toISOString(),
  });
  return { received: true, duplicate: false, eventId: event.id };
};
