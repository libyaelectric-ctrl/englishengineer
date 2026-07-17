import {
  BackendContractValidationResult,
  BackendEndpointContract,
} from './backend-contract.types';

const STANDARD_RETRY = {
  maxAttempts: 2,
  backoffMs: 500,
  retryableStatusCodes: [408, 425, 429, 500, 502, 503, 504],
};

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasString = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'string' && (value[field] as string).trim().length > 0;

const hasBoolean = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'boolean';

const validateContractVersion = (
  value: Record<string, unknown>,
  errors: string[],
  contractVersion: string
): void => {
  if (value.contractVersion !== contractVersion) {
    errors.push(`contractVersion must be ${contractVersion}`);
  }
};

export const validateHealthResponse = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
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
