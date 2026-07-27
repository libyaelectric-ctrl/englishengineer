/**
 * OpenAPI Schema Definitions for Frontend-Backend Contracts
 * 
 * These schemas mirror the backend Swagger definitions
 * and serve as the single source of truth for API contracts.
 */

export const OpenAPISchemas = {
  // Auth
  LoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
    },
    required: ['email', 'password'],
  },

  LoginResponse: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      user: { $ref: '#/components/schemas/User' },
    },
    required: ['token', 'user'],
  },

  // User
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['learner', 'admin', 'instructor'] },
      createdAt: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'email', 'name', 'role'],
  },

  // Assessment
  AssessmentRequest: {
    type: 'object',
    properties: {
      skill: { type: 'string', enum: ['reading', 'writing', 'listening', 'speaking', 'vocabulary', 'grammar'] },
      level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
      answers: { type: 'array', items: { type: 'object' } },
    },
    required: ['skill', 'level', 'answers'],
  },

  AssessmentResponse: {
    type: 'object',
    properties: {
      score: { type: 'number', minimum: 0, maximum: 100 },
      cefrLevel: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
      eloScore: { type: 'number' },
      feedback: { type: 'string' },
      dimensions: { type: 'array', items: { type: 'object' } },
    },
    required: ['score', 'cefrLevel', 'eloScore'],
  },

  // AI Copilot
  AICoachRequest: {
    type: 'object',
    properties: {
      mode: { type: 'string', enum: ['technical-report', 'email', 'meeting', 'code-review', 'presentation', 'debugging', 'architecture', 'incident-response', 'standup', 'interview', 'documentation', 'client-call'] },
      prompt: { type: 'string', minLength: 1 },
      context: { type: 'object' },
      provider: { type: 'string', enum: ['anthropic', 'openai', 'gemini'] },
    },
    required: ['mode', 'prompt'],
  },

  AICoachResponse: {
    type: 'object',
    properties: {
      response: { type: 'string' },
      suggestions: { type: 'array', items: { type: 'string' } },
      corrections: { type: 'array', items: { type: 'object' } },
      provider: { type: 'string' },
      tokensUsed: { type: 'number' },
    },
    required: ['response', 'provider'],
  },

  // Billing
  SubscriptionRequest: {
    type: 'object',
    properties: {
      tier: { type: 'string', enum: ['free', 'pro', 'team'] },
      interval: { type: 'string', enum: ['monthly', 'annual'] },
      seats: { type: 'number', minimum: 1 },
    },
    required: ['tier', 'interval'],
  },

  SubscriptionResponse: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['active', 'canceled', 'past_due', 'unpaid'] },
      tier: { type: 'string' },
      currentPeriodEnd: { type: 'string', format: 'date-time' },
      cancelAtPeriodEnd: { type: 'boolean' },
    },
    required: ['id', 'status', 'tier'],
  },

  // Error
  ErrorResponse: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      message: { type: 'string' },
      statusCode: { type: 'number' },
      timestamp: { type: 'string', format: 'date-time' },
      path: { type: 'string' },
    },
    required: ['code', 'message', 'statusCode'],
  },
} as const;

export type OpenAPISchemaName = keyof typeof OpenAPISchemas;
