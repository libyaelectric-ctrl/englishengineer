export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EngineerOS API',
    version: '4.0.1',
    description: 'Backend API for EngineerOS English learning platform',
  },
  servers: [
    {
      url: 'https://englishengineer-production.up.railway.app',
      description: 'Production',
    },
    {
      url: 'http://localhost:8787',
      description: 'Development',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        responses: {
          200: {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    status: { type: 'string' },
                    version: { type: 'string' },
                    checks: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/ai/coach': {
      post: {
        tags: ['AI'],
        summary: 'AI Coach request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', maxLength: 20000 },
                  operation: {
                    type: 'string',
                    enum: [
                      'analyzeProgress',
                      'evaluateEngineeringEnglish',
                      'analyzeText',
                      'generatePractice',
                    ],
                  },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'AI response' },
          401: { description: 'Unauthorized' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/api/billing/checkout': {
      post: {
        tags: ['Billing'],
        summary: 'Create Stripe checkout session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'successUrl', 'cancelUrl'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  successUrl: { type: 'string', format: 'uri' },
                  cancelUrl: { type: 'string', format: 'uri' },
                  planId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Checkout URL' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/vocabulary/lookup': {
      get: {
        tags: ['Vocabulary'],
        summary: 'Lookup vocabulary word',
        parameters: [
          {
            name: 'word',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'targetLang',
            in: 'query',
            schema: { type: 'string', default: 'tr' },
          },
        ],
        responses: {
          200: { description: 'Vocabulary entry' },
          400: { description: 'Invalid query' },
        },
      },
    },
    '/api/vocabulary/{id}/progress': {
      post: {
        tags: ['Vocabulary'],
        summary: 'Update vocabulary word progress',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['result'],
                properties: {
                  result: { type: 'string', enum: ['correct', 'incorrect'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Progress updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/progress/overview': {
      get: {
        tags: ['Progress'],
        summary: 'Get user progress overview',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Progress summary' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/speaking/prompts': {
      get: {
        tags: ['Speaking'],
        summary: 'Get speaking prompts',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Speaking prompts list' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/speaking/submit': {
      post: {
        tags: ['Speaking'],
        summary: 'Submit speaking response',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Speaking evaluation' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard stats',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Admin statistics' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Get audit logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Audit logs list' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/api/grammar/{id}/progress': {
      post: {
        tags: ['Grammar'],
        summary: 'Update grammar rule progress',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['result'],
                properties: {
                  result: { type: 'string', enum: ['correct', 'incorrect'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Progress updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/reading/feed': {
      get: {
        tags: ['Reading'],
        summary: 'Get reading feed',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Reading items' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/reading/{id}/score': {
      post: {
        tags: ['Reading'],
        summary: 'Submit reading score',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: {
                  score: { type: 'number', minimum: 0, maximum: 100 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Score recorded' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/listening/feed': {
      get: {
        tags: ['Listening'],
        summary: 'Get listening feed',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Listening items' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/listening/{id}/progress': {
      post: {
        tags: ['Listening'],
        summary: 'Update listening progress',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: {
                  score: { type: 'number', minimum: 0, maximum: 100 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Progress updated' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/writing/prompts': {
      get: {
        tags: ['Writing'],
        summary: 'Get writing prompts',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Writing prompts list' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/writing/submit': {
      post: {
        tags: ['Writing'],
        summary: 'Submit writing response',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['promptId', 'content'],
                properties: {
                  promptId: { type: 'string' },
                  content: { type: 'string', maxLength: 50000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Writing evaluation' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
