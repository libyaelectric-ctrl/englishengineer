export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EngineerOS / EngVox API',
    version: '4.0.22',
    description:
      'Backend API for EngineerOS English learning platform. Covers AI coaching, vocabulary, grammar, reading, writing, speaking, listening, billing, workspace, and admin endpoints.',
    contact: { name: 'EngVox Support', url: 'https://engvox.com' },
  },
  servers: [
    { url: 'https://englishengineer-backend.onrender.com', description: 'Production' },
    { url: 'http://localhost:8787', description: 'Development' },
  ],
  tags: [
    { name: 'Health', description: 'Service health and metrics' },
    { name: 'AI', description: 'AI coaching, translation, transcription' },
    { name: 'Vocabulary', description: 'Vocabulary lookup and progress' },
    { name: 'Grammar', description: 'Grammar rules and progress' },
    { name: 'Reading', description: 'Reading comprehension' },
    { name: 'Writing', description: 'Writing evaluation' },
    { name: 'Speaking', description: 'Speaking prompts and evaluation' },
    { name: 'Listening', description: 'Listening comprehension' },
    { name: 'Progress', description: 'User progress overview' },
    { name: 'Billing', description: 'Subscription, checkout, invoices' },
    { name: 'Workspace', description: 'Team workspaces and documents' },
    { name: 'Export', description: 'GDPR data export' },
    { name: 'Team', description: 'Team analytics' },
    { name: 'Admin', description: 'Admin dashboard and audit logs' },
  ],
  paths: {
    // ─── Health & Metrics ─────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check endpoint',
        description: 'Returns service status, uptime, memory usage, and dependency checks.',
        responses: {
          200: {
            description: 'Service healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    status: { type: 'string', enum: ['ok', 'degraded'] },
                    version: { type: 'string' },
                    environment: { type: 'string' },
                    checks: { type: 'object', description: 'Dependency health' },
                    memory: {
                      type: 'object',
                      properties: {
                        heapUsedMB: { type: 'number' },
                        heapTotalMB: { type: 'number' },
                        rssMB: { type: 'number' },
                      },
                    },
                    uptime: { type: 'number', description: 'Seconds since start' },
                    nodeVersion: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/metrics': {
      get: {
        tags: ['Health'],
        summary: 'Prometheus metrics endpoint',
        description: 'Returns metrics in Prometheus text format.',
        responses: {
          200: {
            description: 'Prometheus metrics',
            content: { 'text/plain': { schema: { type: 'string' } } },
          },
        },
      },
    },

    // ─── AI Routes ────────────────────────────────────────────────────
    '/api/ai/coach': {
      post: {
        tags: ['AI'],
        summary: 'AI Coach — analyze progress',
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
                  operation: { type: 'string', enum: ['analyzeProgress'] },
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
    '/api/ai/writing-review': {
      post: {
        tags: ['AI'],
        summary: 'AI writing evaluation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', maxLength: 50000 },
                  operation: { type: 'string', enum: ['evaluateEngineeringEnglish'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Evaluation result' },
          429: { description: 'Rate limit' },
        },
      },
    },
    '/api/ai/assessment-feedback': {
      post: {
        tags: ['AI'],
        summary: 'AI assessment feedback',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string' },
                  operation: { type: 'string', enum: ['analyzeText'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Assessment result' } },
      },
    },
    '/api/ai/roleplay': {
      post: {
        tags: ['AI'],
        summary: 'AI roleplay practice',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string' },
                  operation: { type: 'string', enum: ['generatePractice'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Roleplay scenario' } },
      },
    },
    '/api/ai/translate': {
      post: {
        tags: ['AI'],
        summary: 'AI translation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string' },
                  operation: { type: 'string', enum: ['translate'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Translation result' } },
      },
    },
    '/api/ai/generate-content': {
      post: {
        tags: ['AI'],
        summary: 'AI content generation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string' },
                  operation: { type: 'string', enum: ['generateContent'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Generated content' } },
      },
    },
    '/api/ai/transcribe': {
      post: {
        tags: ['AI'],
        summary: 'AI audio transcription',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string' },
                  operation: { type: 'string', enum: ['transcribeAudio'] },
                  modeId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Transcription result' } },
      },
    },
    '/api/ai/analytics': {
      get: {
        tags: ['AI'],
        summary: 'Get user AI usage analytics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Usage analytics with limits',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string' },
                    planId: { type: 'string' },
                    limits: {
                      type: 'object',
                      properties: {
                        used: { type: 'number' },
                        remaining: { type: 'number' },
                        daily: { type: 'number', nullable: true },
                        monthly: { type: 'number' },
                      },
                    },
                    totalRequests: { type: 'number' },
                    averageDurationMs: { type: 'number' },
                    totalEstimatedTokens: { type: 'number' },
                    estimatedCostUsd: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/ai/analytics/admin': {
      get: {
        tags: ['AI', 'Admin'],
        summary: 'Get admin AI analytics (all users)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Aggregate AI usage analytics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalRequests: { type: 'number' },
                    totalEstimatedTokens: { type: 'number' },
                    estimatedCostUsd: { type: 'number' },
                    topUsers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          userId: { type: 'string' },
                          totalRequests: { type: 'number' },
                          totalEstimatedTokens: { type: 'number' },
                          estimatedCostUsd: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── Vocabulary ───────────────────────────────────────────────────
    '/api/vocabulary/lookup': {
      get: {
        tags: ['Vocabulary'],
        summary: 'Lookup vocabulary word',
        parameters: [
          { name: 'word', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'targetLang', in: 'query', schema: { type: 'string', default: 'tr' } },
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
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['result'],
                properties: { result: { type: 'string', enum: ['correct', 'incorrect'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Progress updated' } },
      },
    },
    '/api/vocabulary/stats': {
      get: {
        tags: ['Vocabulary'],
        summary: 'Get vocabulary stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Vocabulary statistics' } },
      },
    },

    // ─── Grammar ──────────────────────────────────────────────────────
    '/api/grammar/{id}/progress': {
      post: {
        tags: ['Grammar'],
        summary: 'Update grammar rule progress',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['result'],
                properties: { result: { type: 'string', enum: ['correct', 'incorrect'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Progress updated' } },
      },
    },
    '/api/grammar/stats': {
      get: {
        tags: ['Grammar'],
        summary: 'Get grammar stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Grammar statistics' } },
      },
    },
    '/api/user/access-status': {
      get: {
        tags: ['Grammar'],
        summary: 'Get user content access status',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Access status by level' } },
      },
    },

    // ─── Reading ──────────────────────────────────────────────────────
    '/api/reading/feed': {
      get: {
        tags: ['Reading'],
        summary: 'Get reading feed',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'Reading items' } },
      },
    },
    '/api/reading/generate': {
      post: {
        tags: ['Reading'],
        summary: 'AI-generate reading content',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  topic: { type: 'string' },
                  level: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] },
                  discipline: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Generated reading passage' } },
      },
    },
    '/api/reading/{id}/progress': {
      post: {
        tags: ['Reading'],
        summary: 'Submit reading score',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: { score: { type: 'number', minimum: 0, maximum: 100 } },
              },
            },
          },
        },
        responses: { 200: { description: 'Score recorded' } },
      },
    },
    '/api/reading/stats': {
      get: {
        tags: ['Reading'],
        summary: 'Get reading stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Reading statistics' } },
      },
    },

    // ─── Writing ──────────────────────────────────────────────────────
    '/api/writing/prompts': {
      get: {
        tags: ['Writing'],
        summary: 'Get writing prompts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'Writing prompts list' } },
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
        responses: { 200: { description: 'Writing evaluation' } },
      },
    },
    '/api/writing/stats': {
      get: {
        tags: ['Writing'],
        summary: 'Get writing stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Writing statistics' } },
      },
    },
    '/api/writing/{id}': {
      get: {
        tags: ['Writing'],
        summary: 'Get writing submission detail',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Writing submission detail' },
          404: { description: 'Not found' },
        },
      },
    },

    // ─── Speaking ─────────────────────────────────────────────────────
    '/api/speaking/prompts': {
      get: {
        tags: ['Speaking'],
        summary: 'Get speaking prompts',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Speaking prompts list' } },
      },
    },
    '/api/speaking/submit': {
      post: {
        tags: ['Speaking'],
        summary: 'Submit speaking response',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  promptId: { type: 'string' },
                  transcript: { type: 'string' },
                  durationMs: { type: 'number' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Speaking evaluation' } },
      },
    },
    '/api/speaking/audio-upload': {
      post: {
        tags: ['Speaking'],
        summary: 'Upload speaking audio for evaluation',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { audio: { type: 'string', format: 'binary' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Audio upload result' } },
      },
    },
    '/api/speaking/stats': {
      get: {
        tags: ['Speaking'],
        summary: 'Get speaking stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Speaking statistics' } },
      },
    },
    '/api/speaking/{id}': {
      get: {
        tags: ['Speaking'],
        summary: 'Get speaking submission detail',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Speaking detail' }, 404: { description: 'Not found' } },
      },
    },

    // ─── Listening ────────────────────────────────────────────────────
    '/api/listening/feed': {
      get: {
        tags: ['Listening'],
        summary: 'Get listening feed',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'Listening items' } },
      },
    },
    '/api/listening/{id}/progress': {
      post: {
        tags: ['Listening'],
        summary: 'Update listening progress',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['score'],
                properties: { score: { type: 'number', minimum: 0, maximum: 100 } },
              },
            },
          },
        },
        responses: { 200: { description: 'Progress updated' } },
      },
    },
    '/api/listening/stats': {
      get: {
        tags: ['Listening'],
        summary: 'Get listening stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Listening statistics' } },
      },
    },

    // ─── Progress ─────────────────────────────────────────────────────
    '/api/progress/overview': {
      get: {
        tags: ['Progress'],
        summary: 'Get user progress overview',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Progress summary' } },
      },
    },

    // ─── Billing ──────────────────────────────────────────────────────
    '/api/billing/create-checkout-session': {
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
        responses: { 200: { description: 'Checkout URL' } },
      },
    },
    '/api/billing/create-topup-session': {
      post: {
        tags: ['Billing'],
        summary: 'Create credit top-up session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['successUrl', 'cancelUrl'],
                properties: {
                  credits: { type: 'number', minimum: 1 },
                  successUrl: { type: 'string', format: 'uri' },
                  cancelUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Top-up checkout URL' } },
      },
    },
    '/api/billing/create-customer-portal-session': {
      post: {
        tags: ['Billing'],
        summary: 'Create Stripe customer portal session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['returnUrl'],
                properties: { returnUrl: { type: 'string', format: 'uri' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Portal URL' } },
      },
    },
    '/api/billing/invoices': {
      get: {
        tags: ['Billing'],
        summary: 'Get user invoices',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Invoice list' } },
      },
    },
    '/api/billing/subscription-status': {
      get: {
        tags: ['Billing'],
        summary: 'Get subscription status',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Subscription status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    planId: { type: 'string' },
                    status: {
                      type: 'string',
                      enum: ['active', 'trialing', 'canceled', 'past_due', 'none'],
                    },
                    currentPeriodEnd: { type: 'string', format: 'date-time' },
                    topupCredits: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── Workspace ────────────────────────────────────────────────────
    '/api/workspaces': {
      get: {
        tags: ['Workspace'],
        summary: 'List user workspaces',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Workspace list' } },
      },
      post: {
        tags: ['Workspace'],
        summary: 'Create workspace',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string' }, description: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Workspace created' } },
      },
    },
    '/api/workspaces/{id}': {
      get: {
        tags: ['Workspace'],
        summary: 'Get workspace details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Workspace details' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Workspace'],
        summary: 'Delete workspace',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/api/workspaces/{id}/memory': {
      put: {
        tags: ['Workspace'],
        summary: 'Update workspace memory',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  memory: { type: 'object', description: 'Key-value memory entries' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Memory updated' } },
      },
    },
    '/api/workspaces/{id}/documents': {
      post: {
        tags: ['Workspace'],
        summary: 'Add document to workspace',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'content'],
                properties: { name: { type: 'string' }, content: { type: 'string' } },
              },
            },
          },
        },
        responses: { 201: { description: 'Document added' } },
      },
    },
    '/api/workspaces/{id}/documents/{docId}': {
      delete: {
        tags: ['Workspace'],
        summary: 'Delete workspace document',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'docId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 204: { description: 'Deleted' } },
      },
    },

    // ─── Export (GDPR) ────────────────────────────────────────────────
    '/api/v1/export/me': {
      get: {
        tags: ['Export'],
        summary: 'Export all user data (GDPR)',
        security: [{ bearerAuth: [] }],
        description:
          'Returns complete user data as JSON: profile, progress, vocabulary, writing, speaking, listening, reading.',
        responses: {
          200: {
            description: 'Full user data export',
            content: {
              'application/json': { schema: { type: 'object', description: 'Complete user data' } },
            },
          },
        },
      },
    },
    '/api/v1/export/me/summary': {
      get: {
        tags: ['Export'],
        summary: 'Export user data summary (lightweight)',
        security: [{ bearerAuth: [] }],
        description: 'Returns summary without detailed records.',
        responses: { 200: { description: 'User data summary' } },
      },
    },

    // ─── Team Analytics ───────────────────────────────────────────────
    '/api/v1/team/analytics': {
      get: {
        tags: ['Team'],
        summary: 'Get team analytics (manager)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Team analytics with member progress',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    teamId: { type: 'string' },
                    memberCount: { type: 'number' },
                    averageProgress: { type: 'number' },
                    members: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          userId: { type: 'string' },
                          progress: { type: 'number' },
                          streak: { type: 'number' },
                          lastActive: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/team/analytics/export': {
      get: {
        tags: ['Team'],
        summary: 'Export team analytics as CSV',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'CSV download',
            content: { 'text/csv': { schema: { type: 'string' } } },
          },
        },
      },
    },

    // ─── Admin ────────────────────────────────────────────────────────
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard stats',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Admin statistics' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Get audit logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: { 200: { description: 'Audit logs list' }, 403: { description: 'Forbidden' } },
      },
    },
    '/api/admin/rate-limit-metrics': {
      get: {
        tags: ['Admin'],
        summary: 'Get rate limit metrics',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Rate limit metrics by scope' },
          403: { description: 'Forbidden' },
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
        description: 'Clerk JWT token from Authorization header',
      },
    },
  },
};
