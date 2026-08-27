import { createHmac, timingSafeEqual } from 'node:crypto';

import type { DodoConfig, PlanId } from '../types.js';
import {
  BillingCheckoutBody,
  BillingPortalBody,
  BillingProvider,
  BillingTopupBody,
  NormalizedWebhookEvent,
  WebhookProcessingResult,
  processNormalizedWebhookEvent,
} from './billing-provider.js';
import type { BillingRepository } from './billing-webhook-handlers.js';
import { logger } from './logger.js';
import { ApiError } from './errors.js';

const WEBHOOK_PATH = '/api/webhooks/dodo';

/** Standard Webhooks headers Dodo sends on every webhook delivery. */
const WEBHOOK_SIGNATURE_HEADERS = ['webhook-id', 'webhook-timestamp', 'webhook-signature'];

/**
 * Dodo subscription status -> app SubscriptionStatus.
 * The app's status enum is intentionally Stripe-shaped; map Dodo's lifecycle
 * states onto the closest equivalent.
 */
const DODO_STATUS_TO_APP_STATUS: Record<string, string> = {
  pending: 'incomplete',
  active: 'active',
  on_hold: 'past_due',
  paused: 'past_due',
  cancelled: 'canceled',
  failed: 'past_due',
  expired: 'canceled',
};

/** planId -> { interval -> DodoConfig product key } */
const PRODUCT_KEY_BY_PLAN: Record<Exclude<PlanId, 'free'>, { month: string; year: string }> = {
  junior: { month: 'productJuniorMonthly', year: 'productJuniorAnnual' },
  senior: { month: 'productSeniorMonthly', year: 'productSeniorAnnual' },
  specialist: { month: 'productSpecialistMonthly', year: 'productSpecialistAnnual' },
  master: { month: 'productMasterMonthly', year: 'productMasterAnnual' },
  team: { month: 'productTeamMonthly', year: 'productTeamAnnual' },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getHeader = (
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined => {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
};

const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

/**
 * Standard Webhooks secret is `whsec_<base64-key>`; the HMAC key is the
 * base64-decoded portion after the `whsec_` prefix (not the literal string).
 */
const hmacKeyFromSecret = (secret: string): Buffer => {
  const raw = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  return Buffer.from(raw, 'base64');
};

/**
 * Standard Webhooks signature verification:
 * HMAC-SHA256(`${webhook-id}.${webhook-timestamp}.${rawPayload}`, decodedKey),
 * compared against the `webhook-signature` header (`v1,<base64>`, possibly
 * space-separated when multiple signatures are sent).
 * Returns the verified webhook id used for idempotency.
 */
const verifyDodoSignature = (
  rawBody: Buffer,
  headers: Record<string, string | string[] | undefined>,
  secret: string
): string => {
  const id = getHeader(headers, 'webhook-id');
  const timestamp = getHeader(headers, 'webhook-timestamp');
  const signatureHeader = getHeader(headers, 'webhook-signature');

  if (!id || !timestamp || !signatureHeader) {
    throw new ApiError(
      400,
      'invalid_webhook_signature',
      'Dodo webhook signature verification failed.'
    );
  }

  const message = `${id}.${timestamp}.${rawBody.toString('utf8')}`;
  const expected = createHmac('sha256', hmacKeyFromSecret(secret)).update(message).digest('base64');

  // Standard Webhooks sends `v1,<base64>` (possibly several, space-separated).
  const accepted = signatureHeader
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(','))
    .filter((parts) => parts.length === 2)
    .map((parts) => parts[1]);

  if (!accepted.some((provided) => safeEqual(expected, provided))) {
    throw new ApiError(
      400,
      'invalid_webhook_signature',
      'Dodo webhook signature verification failed.'
    );
  }

  return id;
};

/** ISO date-time -> epoch seconds (the shape the repository handlers expect). */
const parseIsoToSeconds = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
};

/**
 * Resolve the app plan id from a Dodo product id by reverse-mapping the
 * configured product ids. Returns null when the product is unknown (e.g. the
 * top-up product or a product that is not wired up yet).
 */
const planIdFromProductId = (config: DodoConfig, productId: string): PlanId | null => {
  const values = config as unknown as Record<string, string | null | undefined>;
  for (const [planId, keys] of Object.entries(PRODUCT_KEY_BY_PLAN)) {
    for (const key of Object.values(keys)) {
      if (values[key] === productId) return planId as PlanId;
    }
  }
  return null;
};

const getUserId = (data: Record<string, unknown>): string | null => {
  const meta = isRecord(data.metadata) ? data.metadata : {};
  if (typeof meta.userId === 'string' && meta.userId.trim()) return meta.userId.trim();
  const customer = isRecord(data.customer) ? data.customer : {};
  const customerMeta = isRecord(customer.metadata) ? customer.metadata : {};
  if (typeof customerMeta.userId === 'string' && customerMeta.userId.trim()) {
    return customerMeta.userId.trim();
  }
  return null;
};

const getCustomerId = (data: Record<string, unknown>): string | null => {
  const customer = isRecord(data.customer) ? data.customer : {};
  return typeof customer.customer_id === 'string' ? customer.customer_id : null;
};

/**
 * Maps a Dodo webhook event onto the shared normalized shape consumed by the
 * repository handlers. Returns null when the event should be acknowledged but
 * ignored (unknown events, or payment events without a subscription).
 */
const mapPaymentSucceeded = (
  webhookId: string,
  data: Record<string, unknown>,
  ignored: NormalizedWebhookEvent
): NormalizedWebhookEvent => {
  // Subscription first/renewal payments are handled via subscription.* events.
  // Only one-time purchases (top-up credits) are applied from payments.
  if (typeof data.subscription_id === 'string') return ignored;
  const userId = getUserId(data);
  const customerId = getCustomerId(data);
  const meta = isRecord(data.metadata) ? data.metadata : {};
  return {
    id: webhookId,
    type: 'checkout.session.completed',
    data: {
      metadata: {
        ...(userId ? { userId } : {}),
        type: meta.type === 'topup' ? 'topup' : 'one_time',
        credits: typeof meta.credits === 'string' ? meta.credits : '50',
        planId: typeof meta.planId === 'string' ? meta.planId : 'junior',
      },
      customer: customerId,
      subscription: null,
    },
  };
};

const mapPaymentFailed = (
  webhookId: string,
  data: Record<string, unknown>,
  ignored: NormalizedWebhookEvent
): NormalizedWebhookEvent => {
  // Renewal failure -> mark the user past due. One-time failures are ignored.
  if (typeof data.subscription_id !== 'string') return ignored;
  const userId = getUserId(data);
  return {
    id: webhookId,
    type: 'invoice.payment_failed',
    data: {
      metadata: userId ? { userId } : {},
      subscription: data.subscription_id,
    },
  };
};

const mapSubscriptionEvent = (
  config: DodoConfig,
  webhookId: string,
  data: Record<string, unknown>
): NormalizedWebhookEvent => {
  const userId = getUserId(data);
  const customerId = getCustomerId(data);
  const meta = isRecord(data.metadata) ? data.metadata : {};
  const rawStatus = typeof data.status === 'string' ? data.status : '';
  const appStatus = DODO_STATUS_TO_APP_STATUS[rawStatus] ?? 'incomplete';
  const planIdFromMeta = typeof meta.planId === 'string' ? meta.planId : null;
  const planIdFromProduct =
    typeof data.product_id === 'string' ? planIdFromProductId(config, data.product_id) : null;
  const planId = planIdFromMeta ?? planIdFromProduct;
  const periodEnd = parseIsoToSeconds(data.next_billing_date);

  return {
    id: webhookId,
    type: 'customer.subscription.updated',
    data: {
      metadata: {
        ...(userId ? { userId } : {}),
        ...(planId ? { planId } : {}),
      },
      id: typeof data.subscription_id === 'string' ? data.subscription_id : null,
      customer: customerId,
      status: appStatus,
      cancel_at_period_end: data.cancel_at_next_billing_date === true,
      ...(periodEnd !== null ? { current_period_end: periodEnd } : {}),
    },
  };
};

/**
 * Maps a Dodo webhook event onto the shared normalized shape consumed by the
 * repository handlers. Returns null when the event should be acknowledged but
 * ignored (unknown events, or payment events without a subscription).
 */
const normalizeDodoEvent = (
  config: DodoConfig,
  webhookId: string,
  type: string,
  data: Record<string, unknown>
): NormalizedWebhookEvent => {
  const ignored: NormalizedWebhookEvent = { id: webhookId, type: 'ignored', data: {} };

  if (type === 'payment.succeeded') return mapPaymentSucceeded(webhookId, data, ignored);
  if (type === 'payment.failed') return mapPaymentFailed(webhookId, data, ignored);
  if (type.startsWith('subscription.')) return mapSubscriptionEvent(config, webhookId, data);

  return ignored;
};

const postJson = async (
  fetchImpl: typeof fetch,
  baseUrl: string,
  apiKey: string,
  path: string,
  body?: Record<string, unknown>,
  query?: Record<string, string>
): Promise<Record<string, unknown>> => {
  const url = new URL(path, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  }
  const response = await fetchImpl(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    let detail = '';
    try {
      detail = await response.text();
    } catch {
      /* ignore read errors */
    }
    throw new ApiError(
      502,
      'dodo_api_error',
      `Dodo Payments request failed (${response.status}).${detail ? ` ${detail.slice(0, 300)}` : ''}`
    );
  }
  const parsed = (await response.json()) as unknown;
  return isRecord(parsed) ? parsed : {};
};

interface CreateDodoBillingProviderOpts {
  config: DodoConfig;
  repository: BillingRepository;
  fetchImpl?: typeof fetch;
}

export const createDodoBillingProvider = ({
  config,
  repository,
  fetchImpl = fetch,
}: CreateDodoBillingProviderOpts): BillingProvider => {
  const ensureConfigured = () => {
    if (!config.configured || !config.apiKey || !config.baseUrl) {
      throw new ApiError(
        503,
        'STRIPE_NOT_CONFIGURED',
        'Billing backend is unavailable because the payment provider is not configured.'
      );
    }
  };

  const resolveProductId = (planId: string, billingInterval: 'month' | 'year'): string => {
    const normalized = planId as Exclude<PlanId, 'free'>;
    const keys = PRODUCT_KEY_BY_PLAN[normalized];
    if (!keys) {
      throw new ApiError(400, 'INVALID_PLAN', `Unknown plan: "${planId}".`);
    }
    const key = billingInterval === 'year' ? keys.year : keys.month;
    const productId = (config as unknown as Record<string, string | null | undefined>)[key];
    if (!productId) {
      throw new ApiError(
        503,
        'dodo_not_configured',
        `No Dodo product is configured for plan "${planId}" (${billingInterval}).`
      );
    }
    return productId;
  };

  return {
    name: 'dodo',
    configured: config.configured === true && !!config.apiKey && !!config.baseUrl,
    webhookRoutes: [{ path: WEBHOOK_PATH, signatureHeaders: WEBHOOK_SIGNATURE_HEADERS }],

    async createCheckoutSession(userId, body: BillingCheckoutBody) {
      ensureConfigured();
      const billingInterval = body.billingInterval === 'year' ? 'year' : 'month';
      const productId = resolveProductId(body.planId, billingInterval);

      const session = await postJson(fetchImpl, config.baseUrl!, config.apiKey!, '/checkouts', {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: body.email },
        return_url: body.successUrl,
        cancel_url: body.cancelUrl,
        metadata: { userId, planId: body.planId, type: 'subscription' },
      });

      const url = typeof session.checkout_url === 'string' ? session.checkout_url : null;
      if (!url) {
        throw new ApiError(502, 'dodo_invalid_response', 'Dodo did not return a checkout URL.');
      }
      return { url };
    },

    async createTopupCheckoutSession(userId, body: BillingTopupBody) {
      ensureConfigured();
      const productId = config.productTopup;
      if (!productId) {
        throw new ApiError(503, 'dodo_not_configured', 'No Dodo top-up product is configured.');
      }

      const session = await postJson(fetchImpl, config.baseUrl!, config.apiKey!, '/checkouts', {
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: { email: body.email },
        return_url: body.successUrl,
        cancel_url: body.cancelUrl,
        metadata: { userId, type: 'topup', credits: '50' },
      });

      const url = typeof session.checkout_url === 'string' ? session.checkout_url : null;
      if (!url) {
        throw new ApiError(502, 'dodo_invalid_response', 'Dodo did not return a checkout URL.');
      }
      return { url };
    },

    async createPortalSession(customerId, body: BillingPortalBody) {
      ensureConfigured();
      const session = await postJson(
        fetchImpl,
        config.baseUrl!,
        config.apiKey!,
        `/customers/${encodeURIComponent(customerId)}/customer-portal/session`,
        undefined,
        { return_url: body.returnUrl }
      );
      const url = typeof session.link === 'string' ? session.link : null;
      if (!url) {
        throw new ApiError(502, 'dodo_invalid_response', 'Dodo did not return a portal URL.');
      }
      return { url };
    },

    async processWebhook(rawBody, headers, onEventDetected): Promise<WebhookProcessingResult> {
      ensureConfigured();
      if (!config.webhookSecret) {
        throw new ApiError(
          503,
          'dodo_webhook_not_configured',
          'Dodo webhook verification is not configured.'
        );
      }

      const webhookId = verifyDodoSignature(rawBody, headers, config.webhookSecret);

      let type = 'unknown';
      let data: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(rawBody.toString('utf8')) as unknown;
        if (isRecord(parsed)) {
          type = typeof parsed.type === 'string' ? parsed.type : 'unknown';
          data = isRecord(parsed.data) ? parsed.data : {};
        }
      } catch {
        /* unparseable payloads are acknowledged and skipped */
      }

      if (typeof onEventDetected === 'function')
        onEventDetected('signature_verification', webhookId, type);

      return processNormalizedWebhookEvent(
        repository,
        normalizeDodoEvent(config, webhookId, type, data)
      );
    },
  };
};
