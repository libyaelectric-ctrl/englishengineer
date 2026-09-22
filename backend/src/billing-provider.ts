import type { BillingProviderName } from '../types.js';
import type {
  BillingRepository,
  WebhookCommit,
  WebhookObject,
} from './billing-webhook-handlers.js';
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

export interface InvoiceRecord {
  id: string;
  date: string;
  amount: string;
  status: string;
  invoicePdf: string | null;
}

export const formatMinorAmount = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  const digits = formatter.resolvedOptions().maximumFractionDigits;
  return formatter.format(amount / 10 ** (digits ?? 2));
};

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
  listInvoices?(customerId: string): Promise<InvoiceRecord[]>;
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
  if (repository.commitWebhook) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const change: WebhookCommit = {
        eventId: event.id,
        eventType: event.type,
        userId: null,
        expected: null,
        subscription: null,
        customer: null,
      };
      // Stage handler writes; the adapter commits state and event identity together.
      await dispatchWebhookEvent(
        {
          ...repository,
          getSubscriptionStatus: async (userId) => {
            change.userId = userId;
            change.expected = await repository.getSubscriptionStatus(userId);
            return change.expected;
          },
          upsertSubscriptionStatus: async (userId, subscription) => {
            change.userId = userId;
            change.subscription = subscription;
          },
          upsertBillingCustomer: async (customer) => {
            change.customer = customer;
          },
        },
        event.type,
        event.data
      );
      const result = await repository.commitWebhook(change);
      if (result !== 'conflict')
        return { received: true, duplicate: result === 'duplicate', eventId: event.id };
    }
    throw new Error('Billing state changed concurrently; retry webhook delivery.');
  }
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
