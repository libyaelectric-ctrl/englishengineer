# EngVox Backend

Express.js API server for EngVox — handles AI coaching, billing, vocabulary, and workspace operations.

## Quick Start

```bash
cd backend
npm ci
cp .env.example .env   # configure credentials
npm start              # runs on port 3001
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/ai/coach` | JWT | AI coaching |
| POST | `/api/ai/writing-review` | JWT | Writing review |
| POST | `/api/ai/assessment-feedback` | JWT | Assessment feedback |
| POST | `/api/ai/roleplay` | JWT | Roleplay scenario |
| GET | `/api/billing/status` | JWT | Subscription status |
| POST | `/api/billing/checkout` | JWT | Create Stripe checkout |
| POST | `/api/billing/portal` | JWT | Stripe customer portal |
| POST | `/api/webhooks/stripe` | Signature | Stripe webhook |
| GET | `/api/vocabulary/lookup` | JWT | Vocabulary lookup |
| POST | `/api/workspace/create` | JWT | Create workspace |
| GET | `/api/workspace/list` | JWT | List workspaces |
| PUT | `/api/workspace/:id` | JWT | Update workspace |
| DELETE | `/api/workspace/:id` | JWT | Delete workspace |

### Example: Health Check

```bash
curl https://englishengineer-production.up.railway.app/api/health
```

Response:
```json
{
  "ok": true,
  "version": "4.0.1",
  "environment": "production",
  "aiConfigured": true,
  "stripeConfigured": true,
  "supabaseConfigured": true,
  "mockMode": false
}
```

### Example: AI Coach

```bash
curl -X POST https://englishengineer-production.up.railway.app/api/ai/coach \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I write an RFI?", "context": "site-meeting"}'
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `AI_PROVIDER` | No | `mock`, `openai`, `anthropic`, `gemini` |
| `UPSTASH_REDIS_REST_URL` | Prod | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Prod | Upstash Redis token |

## Testing

```bash
npm test
```

## Rate Limiting

- Global: 200 req/15min per IP
- AI: 30 req/15min per user
- Billing: 100 req/15min per user
- Vocabulary: 60 req/15min per user
- Workspace: 100 req/15min per user
