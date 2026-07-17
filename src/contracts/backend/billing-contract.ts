import {
  BackendContractValidationResult,
  BackendEndpointContract,
} from './backend-contract.types';

const STANDARD_RETRY = {
  maxAttempts: 2,
  backoffMs: 500,
  retryableStatusCodes: [408, 425, 429, 500, 502, 503, 504],
};

const NO_RETRY = {
  maxAttempts: 1,
  backoffMs: 0,
  retryableStatusCodes: [],
};

export const BILLING_BACKEND_ENDPOINTS: BackendEndpointContract[] = [
  {
    id: 'billing.createCheckoutSession',
    method: 'POST',
    path: '/api/billing/create-checkout-session',
    requiresAuth: true,
    timeoutMs: 15_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'billing.checkout' },
    requestSchema: {
      requiredFields: [
        'contractVersion',
        'userId',
        'email',
        'planId',
        'successUrl',
        'cancelUrl',
      ],
      optionalFields: [],
      notes: 'Server creates Stripe Checkout session and returns redirect URL.',
    },
    responseSchema: {
      requiredFields: ['contractVersion', 'url', 'metadata'],
      optionalFields: [],
      notes: 'Frontend redirects only to the URL returned by the backend.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'billing.customerPortal',
    method: 'POST',
    path: '/api/billing/create-customer-portal-session',
    requiresAuth: true,
    timeoutMs: 15_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'billing.portal' },
    requestSchema: {
      requiredFields: ['contractVersion', 'userId', 'returnUrl'],
      optionalFields: [],
      notes: 'Server creates Stripe Customer Portal session.',
    },
    responseSchema: {
      requiredFields: ['contractVersion', 'url', 'metadata'],
      optionalFields: [],
      notes: 'No subscription decisions are made by the frontend.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'billing.subscriptionStatus',
    method: 'GET',
    path: '/api/billing/subscription-status',
    requiresAuth: true,
    timeoutMs: 15_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'billing.status' },
    requestSchema: {
      requiredFields: ['userId'],
      optionalFields: [],
      notes: 'Server returns the subscription source of truth.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'userId',
        'planId',
        'status',
        'source',
        'updatedAt',
      ],
      optionalFields: ['currentPeriodEnd', 'cancelAtPeriodEnd'],
      notes:
        'Entitlements are derived from server-confirmed subscription status.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'billing.stripeWebhook',
    method: 'POST',
    path: '/api/webhooks/stripe',
    requiresAuth: false,
    timeoutMs: 15_000,
    providerMode: 'real',
    retry: NO_RETRY,
    rateLimitHook: { scope: 'webhook', limitKey: 'stripe.webhook' },
    requestSchema: {
      requiredFields: ['rawBody', 'stripe-signature'],
      optionalFields: [],
      notes: 'Backend must validate the Stripe signature before processing.',
    },
    responseSchema: {
      requiredFields: ['received'],
      optionalFields: [],
      notes: 'Webhook updates subscription source of truth server-side.',
    },
    requiresServerSignature: true,
  },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasString = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'string' && (value[field] as string).trim().length > 0;

const validateContractVersion = (
  value: Record<string, unknown>,
  errors: string[],
  contractVersion: string
): void => {
  if (value.contractVersion !== contractVersion) {
    errors.push(`contractVersion must be ${contractVersion}`);
  }
};

export const validateCheckoutSessionRequest = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  ['userId', 'email', 'planId', 'successUrl', 'cancelUrl'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateCustomerPortalRequest = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  ['userId', 'returnUrl'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateBillingRedirectResponse = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  if (!hasString(payload, 'url')) errors.push('url is required');
  if (!isRecord(payload.metadata)) errors.push('metadata is required');

  return { valid: errors.length === 0, errors };
};

export const validateSubscriptionStatusResponse = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  ['userId', 'planId', 'status', 'source', 'updatedAt'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateStripeWebhookRequest = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  ['eventId', 'eventType', 'idempotencyKey', 'receivedAt'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });
  if (payload.signatureVerified !== true) {
    errors.push('signatureVerified must be true before webhook processing');
  }

  return { valid: errors.length === 0, errors };
};

export const STRIPE_WEBHOOK_EVENT_STATES: Record<
  string,
  string
> = {
  'checkout.session.completed': 'checkout_completed',
  'invoice.payment_failed': 'payment_failed',
  'customer.subscription.created': 'subscription_active',
  'customer.subscription.updated': 'subscription_updated',
  'customer.subscription.deleted': 'subscription_cancelled',
  'customer.subscription.trial_will_end': 'grace_period',
};

export const mapStripeWebhookState = (
  eventType: string
): string =>
  eventType in STRIPE_WEBHOOK_EVENT_STATES
    ? STRIPE_WEBHOOK_EVENT_STATES[eventType]
    : 'unsupported_event';

export const createStripeWebhookIdempotencyKey = (
  eventId: string,
  eventType: string
): string => `${eventType}:${eventId}`;
