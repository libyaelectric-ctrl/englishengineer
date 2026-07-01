# EngineerOS Backend

This package is the server-side security boundary for AI and Stripe. It is
independent from the Vite frontend and reads secrets only from backend
environment variables.

## Local setup

1. Copy `.env.example` to `.env` inside `backend/` and set only the services
   you intend to verify.
2. Run `npm ci` in `backend/`.
3. Run `npm test`, then `npm start`.
4. Point the frontend AI and billing URLs at `http://localhost:8787/api/ai`
   and `http://localhost:8787/api/billing` as needed.

Local/demo frontend requests use `X-EngineerOS-User-Id` and therefore require
`ALLOW_INSECURE_DEV_AUTH=true` on the local backend. Production requires a
validated Supabase bearer token or an internal bearer secret for trusted
server-to-server callers. Never expose `ENGINEEROS_INTERNAL_API_SECRET` in a
browser or any `VITE_*` variable.

When AI credentials are absent, AI endpoints return an explicitly labelled
mock response. Billing endpoints never simulate payment success: missing
Stripe configuration returns HTTP 503.

The OpenAI adapter uses `POST /v1/chat/completions`, sends the prompt in a
single user message, and reads `choices[0].message.content`. Tests mock this
same contract.

The in-memory subscription and webhook-idempotency stores are development
adapters. Set `BILLING_REPOSITORY=supabase` with backend-only `SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` to use the durable repository. Migration
`202606270001_stripe_processed_events.sql` supplies persistent Stripe event
idempotency. Live Supabase and Stripe staging proof is still required before a
public paid launch.

## Verification

```powershell
npm ci
npm test
```

Deploy the backend separately from the static frontend. Never expose
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY` through `VITE_`
variables.

## Browser E2E

`npm run e2e:browser` runs only when Playwright Chromium is installed. Install
it explicitly with `npm run e2e:browser:install`. Browser installation is not
part of the normal quality gate, and a missing executable must be reported as
"not verified", not as an application pass.

## Vocabulary lookup

`GET /api/vocabulary/lookup?word=<word>&targetLang=tr` validates the query and
uses Free Dictionary API for definitions. Successful results are cached in
backend memory. LibreTranslate is optional through `LIBRETRANSLATE_URL` and
`LIBRETRANSLATE_API_KEY`; MyMemory is disabled unless
`MYMEMORY_ENABLED=true`. Provider failures return a safe error contract and no
fabricated definition or translation.
