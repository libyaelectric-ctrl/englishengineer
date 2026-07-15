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
          '200': {
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
                  operation: { type: 'string', enum: ['analyzeProgress', 'evaluateEngineeringEnglish', 'analyzeText', 'generatePractice'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'AI response' },
          '401': { description: 'Unauthorized' },
          '429': { description: 'Rate limit exceeded' },
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
          '200': { description: 'Checkout URL' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/vocabulary/lookup': {
      get: {
        tags: ['Vocabulary'],
        summary: 'Lookup vocabulary word',
        parameters: [
          { name: 'word', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'targetLang', in: 'query', schema: { type: 'string', default: 'tr' } },
        ],
        responses: {
          '200': { description: 'Vocabulary entry' },
          '400': { description: 'Invalid query' },
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
