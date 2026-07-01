import {
  BackendAIRequest,
  BackendAIResponse,
  BackendCheckoutSessionRequest,
  BackendContractValidationResult,
  BackendContractVersion,
  BackendCustomerPortalRequest,
  BackendEndpointContract,
  BackendEndpointId,
  BackendHealthResponse,
  BackendRedirectResponse,
  BackendStripeWebhookEventType,
  BackendStripeWebhookRequest,
  BackendStripeWebhookState,
  BackendSubscriptionStatusResponse,
} from './backend-contract.types';

export const BACKEND_CONTRACT_VERSION: BackendContractVersion =
  '2026-06-26.saas.v1';

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

export const AI_BACKEND_ENDPOINTS: BackendEndpointContract[] = [
  {
    id: 'ai.coach',
    method: 'POST',
    path: '/api/ai/coach',
    requiresAuth: true,
    timeoutMs: 20_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'ai.coach' },
    requestSchema: {
      requiredFields: [
        'contractVersion',
        'operation',
        'modeId',
        'prompt',
        'metadata',
      ],
      optionalFields: ['context'],
      notes: 'Backend chooses the AI vendor and keeps vendor keys server-side.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'requestId',
        'operation',
        'success',
        'metadata',
      ],
      optionalFields: ['structuredResult', 'text', 'error'],
      notes: 'Success responses must include structuredResult or text.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'ai.writingReview',
    method: 'POST',
    path: '/api/ai/writing-review',
    requiresAuth: true,
    timeoutMs: 20_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'subscription', limitKey: 'ai.writing-review' },
    requestSchema: {
      requiredFields: [
        'contractVersion',
        'operation',
        'modeId',
        'prompt',
        'metadata',
      ],
      optionalFields: ['context'],
      notes: 'Used for professional writing review and feedback.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'requestId',
        'operation',
        'success',
        'metadata',
      ],
      optionalFields: ['structuredResult', 'text', 'error'],
      notes: 'Response must be validated before UI display.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'ai.assessmentFeedback',
    method: 'POST',
    path: '/api/ai/assessment-feedback',
    requiresAuth: true,
    timeoutMs: 20_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'ai.assessment-feedback' },
    requestSchema: {
      requiredFields: [
        'contractVersion',
        'operation',
        'modeId',
        'prompt',
        'metadata',
      ],
      optionalFields: ['context'],
      notes:
        'Generates AI-backed assessment feedback only when backend AI is available.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'requestId',
        'operation',
        'success',
        'metadata',
      ],
      optionalFields: ['structuredResult', 'text', 'error'],
      notes: 'Must not claim official CEFR certification.',
    },
    requiresServerSignature: false,
  },
  {
    id: 'ai.roleplay',
    method: 'POST',
    path: '/api/ai/roleplay',
    requiresAuth: true,
    timeoutMs: 20_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'user', limitKey: 'ai.roleplay' },
    requestSchema: {
      requiredFields: [
        'contractVersion',
        'operation',
        'modeId',
        'prompt',
        'metadata',
      ],
      optionalFields: ['context'],
      notes: 'Supports engineering meeting and consultant roleplay scenarios.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'requestId',
        'operation',
        'success',
        'metadata',
      ],
      optionalFields: ['structuredResult', 'text', 'error'],
      notes: 'Backend returns structured conversation guidance or plain text.',
    },
    requiresServerSignature: false,
  },
];

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

export const HEALTH_BACKEND_ENDPOINTS: BackendEndpointContract[] = [
  {
    id: 'health.status',
    method: 'GET',
    path: '/api/health',
    requiresAuth: false,
    timeoutMs: 5_000,
    providerMode: 'real',
    retry: STANDARD_RETRY,
    rateLimitHook: { scope: 'ip', limitKey: 'health.status' },
    requestSchema: {
      requiredFields: [],
      optionalFields: [],
      notes: 'Health endpoint returns safe configuration flags only.',
    },
    responseSchema: {
      requiredFields: [
        'contractVersion',
        'appVersion',
        'status',
        'environment',
        'checks',
        'timestamp',
      ],
      optionalFields: [],
      notes: 'Health response must never include secrets or raw env values.',
    },
    requiresServerSignature: false,
  },
];

export const BACKEND_ENDPOINTS: BackendEndpointContract[] = [
  ...AI_BACKEND_ENDPOINTS,
  ...BILLING_BACKEND_ENDPOINTS,
  ...HEALTH_BACKEND_ENDPOINTS,
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasString = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'string' && value[field].trim().length > 0;

const hasBoolean = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'boolean';

const validateContractVersion = (
  value: Record<string, unknown>,
  errors: string[]
): void => {
  if (value.contractVersion !== BACKEND_CONTRACT_VERSION) {
    errors.push(`contractVersion must be ${BACKEND_CONTRACT_VERSION}`);
  }
};

export const getBackendEndpoint = (
  endpointId: BackendEndpointId
): BackendEndpointContract | null =>
  BACKEND_ENDPOINTS.find((endpoint) => endpoint.id === endpointId) || null;

export const validateBackendAIRequest = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  if (!hasString(payload, 'operation')) errors.push('operation is required');
  if (!hasString(payload, 'modeId')) errors.push('modeId is required');
  if (!hasString(payload, 'prompt')) errors.push('prompt is required');

  const metadata = payload.metadata;
  if (!isRecord(metadata)) {
    errors.push('metadata is required');
  } else {
    if (!hasString(metadata, 'requestId'))
      errors.push('metadata.requestId is required');
    if (metadata.client !== 'engineeros-web') {
      errors.push('metadata.client must be engineeros-web');
    }
    if (!hasString(metadata, 'sentAt'))
      errors.push('metadata.sentAt is required');
  }

  return { valid: errors.length === 0, errors };
};

export const validateBackendAIResponse = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  if (!hasString(payload, 'requestId')) errors.push('requestId is required');
  if (!hasString(payload, 'operation')) errors.push('operation is required');
  if (!hasBoolean(payload, 'success')) errors.push('success is required');
  if (!isRecord(payload.metadata)) errors.push('metadata is required');

  if (
    payload.success === true &&
    !payload.structuredResult &&
    !hasString(payload, 'text')
  ) {
    errors.push('successful AI response requires structuredResult or text');
  }

  if (payload.success === false && !isRecord(payload.error)) {
    errors.push('failed AI response requires error');
  }

  return { valid: errors.length === 0, errors };
};

export const validateCheckoutSessionRequest = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  ['userId', 'email', 'planId', 'successUrl', 'cancelUrl'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateCustomerPortalRequest = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  ['userId', 'returnUrl'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateBillingRedirectResponse = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  if (!hasString(payload, 'url')) errors.push('url is required');
  if (!isRecord(payload.metadata)) errors.push('metadata is required');

  return { valid: errors.length === 0, errors };
};

export const validateSubscriptionStatusResponse = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  ['userId', 'planId', 'status', 'source', 'updatedAt'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  return { valid: errors.length === 0, errors };
};

export const validateStripeWebhookRequest = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  ['eventId', 'eventType', 'idempotencyKey', 'receivedAt'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });
  if (payload.signatureVerified !== true) {
    errors.push('signatureVerified must be true before webhook processing');
  }

  return { valid: errors.length === 0, errors };
};

export const validateHealthResponse = (
  payload: unknown
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors);
  ['appVersion', 'status', 'environment', 'timestamp'].forEach((field) => {
    if (!hasString(payload, field)) errors.push(`${field} is required`);
  });

  const checks = payload.checks;
  if (!isRecord(checks)) {
    errors.push('checks is required');
  } else {
    [
      'aiBackendConfigured',
      'billingBackendConfigured',
      'supabaseConfigured',
    ].forEach((field) => {
      if (!hasBoolean(checks, field))
        errors.push(`checks.${field} is required`);
    });
  }

  return { valid: errors.length === 0, errors };
};

export const STRIPE_WEBHOOK_EVENT_STATES: Record<
  BackendStripeWebhookEventType,
  BackendStripeWebhookState
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
): BackendStripeWebhookState =>
  eventType in STRIPE_WEBHOOK_EVENT_STATES
    ? STRIPE_WEBHOOK_EVENT_STATES[eventType as BackendStripeWebhookEventType]
    : 'unsupported_event';

export const createStripeWebhookIdempotencyKey = (
  eventId: string,
  eventType: string
): string => `${eventType}:${eventId}`;

export const validateBackendRequest = (
  endpointId: BackendEndpointId,
  payload: unknown
): BackendContractValidationResult => {
  if (endpointId.startsWith('ai.')) return validateBackendAIRequest(payload);
  if (endpointId === 'billing.createCheckoutSession') {
    return validateCheckoutSessionRequest(payload);
  }
  if (endpointId === 'billing.customerPortal') {
    return validateCustomerPortalRequest(payload);
  }
  if (endpointId === 'billing.stripeWebhook') {
    return validateStripeWebhookRequest(payload);
  }
  return { valid: true, errors: [] };
};

export const validateBackendResponse = (
  endpointId: BackendEndpointId,
  payload: unknown
): BackendContractValidationResult => {
  if (endpointId.startsWith('ai.')) return validateBackendAIResponse(payload);
  if (
    endpointId === 'billing.createCheckoutSession' ||
    endpointId === 'billing.customerPortal'
  ) {
    return validateBillingRedirectResponse(payload);
  }
  if (endpointId === 'billing.subscriptionStatus') {
    return validateSubscriptionStatusResponse(payload);
  }
  if (endpointId === 'health.status') {
    return validateHealthResponse(payload);
  }
  return { valid: true, errors: [] };
};

export const mapBackendHttpStatus = (
  status: number
): 'ready' | 'backend-unavailable' | 'rate-limited' | 'validation-error' => {
  if (status === 429) return 'rate-limited';
  if (status >= 500 || status === 408) return 'backend-unavailable';
  if (status >= 400) return 'validation-error';
  return 'ready';
};

export type {
  BackendAIRequest,
  BackendAIResponse,
  BackendCheckoutSessionRequest,
  BackendCustomerPortalRequest,
  BackendHealthResponse,
  BackendRedirectResponse,
  BackendStripeWebhookRequest,
  BackendSubscriptionStatusResponse,
};
