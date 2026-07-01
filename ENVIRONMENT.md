# EngineerOS Environment Configuration

## Purpose

EngineerOS is local-first by default and can start safely without production integrations. Production deployments should configure Supabase, the AI backend proxy and billing backend explicitly.

## Required For Local Development

No environment variable is strictly required for local demo mode.

Recommended local `.env.local`:

```env
VITE_APP_VERSION=4.0.1
VITE_ENVIRONMENT_MODE=local

VITE_AI_PROVIDER=mock
VITE_AI_PROXY_URL=

VITE_AUTH_PROVIDER=local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_BILLING_API_URL=
VITE_ENABLE_MOCK_BILLING=true
```

## Production Variables

### AI Backend

```env
VITE_AI_PROVIDER=backend
VITE_AI_PROXY_URL=https://api.example.com/ai
```

The frontend never calls OpenAI, Anthropic, Gemini or other AI vendors directly. `VITE_AI_PROXY_URL` must point to the EngineerOS backend proxy.

### Supabase Auth

```env
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

Only the public anon key belongs in frontend env. Service role keys must never be exposed.

### Billing

```env
VITE_BILLING_API_URL=https://api.example.com/billing
```

The billing backend creates Stripe Checkout and Customer Portal sessions. Stripe secret keys remain backend-only.

### Application Mode

```env
VITE_APP_VERSION=4.0.1
VITE_ENVIRONMENT_MODE=production
```

Supported environment modes are `local`, `development`, `staging` and `production`.

## Startup Validation

`src/config/environment.config.ts` validates provider combinations at app startup and logs safe warnings for missing optional production services:

- Backend AI without proxy URL
- Supabase auth without URL or anon key
- Billing without backend URL
- Secret-like frontend environment keys

Warnings are non-fatal so local mode and offline-first behavior remain usable.

In production mode, missing backend AI, Supabase or billing configuration becomes a release-blocking validation error. The validation result exposes only safe booleans such as `hasAiProxyUrl`; it never prints secret values.

## Production Setup

1. Create `.env.production` in the deployment platform, not in source control.
2. Configure backend proxy, Supabase and billing URLs.
3. Run `npm run build`.
4. Deploy the generated `dist/` folder to the static hosting target.
5. Confirm backend CORS policies allow the production app origin.

## Backend Rate-Limit Store

Local development and tests use the bounded in-memory limiter by default. A
multi-instance production deployment must use the external Upstash/Redis REST
adapter:

```env
NODE_ENV=production
RATE_LIMIT_STORE=upstash
RATE_LIMIT_STORE_TIMEOUT_MS=3000
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=server-only-token
```

The token is backend-only and must never use the `VITE_` prefix. Production
startup fails when the external store is missing. A temporary single-instance
exception requires both values below, making the risk deliberate and visible:

```env
RATE_LIMIT_STORE=memory
ALLOW_IN_MEMORY_RATE_LIMIT_IN_PRODUCTION=true
```

The exception is unsuitable for horizontally scaled production because
instances do not share counters. External-store failures fail closed with HTTP
503 rather than silently removing abuse protection.

## Security Notes

- Do not commit `.env`, `.env.local` or secret values.
- Do not expose Stripe secret keys.
- Do not expose Supabase service role keys.
- Do not store AI vendor keys in browser storage.
- Do not expose `UPSTASH_REDIS_REST_TOKEN` to the frontend.

## Kademe 8 Staging Gate

Use `npm run kademe8:check` in ordinary CI. It validates the environment schema,
writes a redacted report and exits successfully when credentials are absent;
the report decision remains `BLOCKED` and no live request is sent.

Use `npm run kademe8:verify` only in a protected staging operator environment.
It requires the frontend variables above plus these backend-only values:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `BILLING_REPOSITORY=supabase`
- Stripe test secret, webhook secret and Pro price ID
- `AI_PROVIDER=openai` or `anthropic` with its matching provider key
- `RATE_LIMIT_STORE=upstash` with its REST URL and token

The verifier prints only variable names and `OK`, `MISSING` or `PLACEHOLDER`.
A blocked gate forbids production launch and live customer billing.

### Staging activation order

1. Deploy `backend/` to Railway with root directory `backend`, install command
   `npm ci`, start command `npm start` and health path `/api/health`.
2. Add the Stripe test webhook at
   `https://<railway-host>/api/webhooks/stripe`, then set the returned webhook
   secret only in Railway.
3. Deploy the frontend to Vercel and set `VITE_BILLING_API_URL` and
   `VITE_AI_PROXY_URL` to the Railway backend origin/contracts.
4. Apply Supabase migrations in filename order and run the live two-user plus
   manager RLS isolation test.
5. Run `npm run kademe8:verify` from the protected operator environment.

Do not substitute localhost URLs for staging evidence. Never copy
`SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, OpenAI keys or Upstash tokens into
Vercel frontend variables.

## Optional Monitoring

```env
VITE_ERROR_MONITORING_PROVIDER=
VITE_SENTRY_DSN=
VITE_ERROR_MONITORING_SAMPLE_RATE=0
```

Set the provider to `sentry` only after privacy and deployment review. The app
continues safely without a DSN and does not claim monitoring is active.
