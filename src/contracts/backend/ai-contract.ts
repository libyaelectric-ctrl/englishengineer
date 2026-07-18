import {
  BackendContractValidationResult,
  BackendEndpointContract,
} from './backend-contract.types';

const STANDARD_RETRY = {
  maxAttempts: 2,
  backoffMs: 500,
  retryableStatusCodes: [408, 425, 429, 500, 502, 503, 504],
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasString = (value: Record<string, unknown>, field: string): boolean =>
  typeof value[field] === 'string' &&
  (value[field] as string).trim().length > 0;

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

export const validateBackendAIRequest = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  if (!hasString(payload, 'operation')) errors.push('operation is required');
  if (!hasString(payload, 'modeId')) errors.push('modeId is required');
  if (!hasString(payload, 'prompt')) errors.push('prompt is required');

  const metadata = payload.metadata;
  if (!isRecord(metadata)) {
    errors.push('metadata is required');
  } else {
    if (!hasString(metadata, 'requestId'))
      errors.push('metadata.requestId is required');
    if (metadata.client !== 'EngVox-web') {
      errors.push('metadata.client must be EngVox-web');
    }
    if (!hasString(metadata, 'sentAt'))
      errors.push('metadata.sentAt is required');
  }

  return { valid: errors.length === 0, errors };
};

const validateSuccessResponse = (
  payload: Record<string, unknown>,
  errors: string[]
): void => {
  if (payload.structuredResult || hasString(payload, 'text')) return;
  errors.push('successful AI response requires structuredResult or text');
};

const validateErrorResponse = (
  payload: Record<string, unknown>,
  errors: string[]
): void => {
  if (isRecord(payload.error)) return;
  errors.push('failed AI response requires error');
};

export const validateBackendAIResponse = (
  payload: unknown,
  contractVersion: string
): BackendContractValidationResult => {
  const errors: string[] = [];
  if (!isRecord(payload))
    return { valid: false, errors: ['payload must be an object'] };

  validateContractVersion(payload, errors, contractVersion);
  if (!hasString(payload, 'requestId')) errors.push('requestId is required');
  if (!hasString(payload, 'operation')) errors.push('operation is required');
  if (!hasBoolean(payload, 'success')) errors.push('success is required');
  if (!isRecord(payload.metadata)) errors.push('metadata is required');

  if (payload.success === true) validateSuccessResponse(payload, errors);
  if (payload.success === false) validateErrorResponse(payload, errors);

  return { valid: errors.length === 0, errors };
};
