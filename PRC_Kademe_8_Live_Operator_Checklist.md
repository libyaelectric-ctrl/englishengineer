# PRC Kademe 8 Live Operator Checklist

## Current Decision

**BLOCKED_BY_OPERATOR_ACTION**

The local product and verification tooling are ready. The live sequence cannot
start until a Railway staging backend exists. No secret value is recorded in
this document.

## Required Order

1. Railway backend
2. Stripe TEST webhook and billing flow
3. Vercel frontend
4. Supabase staging migrations and RLS proof
5. AI backend proxy and Upstash proof
6. `npm run kademe8:verify`

## Railway Backend Variables

- `NODE_ENV`
- `PORT`
- `FRONTEND_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BILLING_REPOSITORY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER_MONTHLY`
- `STRIPE_PRICE_CORE_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_TEAM_MONTHLY`
- `RATE_LIMIT_STORE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## Vercel Public Variables

- `VITE_AUTH_PROVIDER`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BILLING_API_URL`
- `VITE_AI_PROVIDER`
- `VITE_AI_PROXY_URL`

Never add these backend secrets to Vercel:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `UPSTASH_REDIS_REST_TOKEN`

## Exact Operator Actions

### 1. Railway

1. Create a staging service from this repository and set its root to
   `backend/`.
2. Use `npm ci` as the install command and `npm start` as the start command.
3. Enter the Railway variable names above in the Railway dashboard. Do not copy
   backend secrets into Vercel.
4. Deploy and verify `GET https://<railway-host>/api/health` returns HTTP 200.
5. Set `FRONTEND_ORIGIN` after the Vercel preview URL is known and redeploy.

### 2. Stripe TEST

1. Remain in Stripe TEST mode.
2. Create the Starter, Core, Pro and Team monthly prices.
3. Add `https://<railway-host>/api/webhooks/stripe` as the webhook endpoint.
4. Select checkout, subscription and invoice events documented in `STRIPE.md`.
5. Save the webhook signing secret only in Railway.
6. Complete a test checkout, open the test customer portal and confirm the
   Supabase subscription record changes.

### 3. Vercel

1. Import the repository into the authenticated Vercel account.
2. Keep the frontend root at the repository root.
3. Set `VITE_BILLING_API_URL=https://<railway-host>`.
4. Set `VITE_AI_PROXY_URL=https://<railway-host>/api/ai`.
5. Add only the public Vite variables listed above.
6. Deploy and check the landing page, dashboard, pricing and AI Copilot.

### 4. Supabase Staging

1. Link a non-production Supabase project.
2. Apply every migration in `supabase/migrations/`.
3. Create learner A, learner B and manager test identities.
4. Execute the isolation checks in
   `PRC_Supabase_RLS_Live_Evidence_Report.md` using synthetic text only.

### 5. AI and Upstash

1. Keep the AI key and Upstash token in Railway only.
2. Send one authenticated AI request through the deployed backend proxy.
3. Verify no provider key appears in browser requests or responses.
4. Confirm the configured Upstash counter increments and the documented limit
   returns HTTP 429.

### 6. Final Verification

Run `npm run kademe8:check`, then `npm run kademe8:verify`. Kademe 8 is closed
only when the latter exits 0 with real staging evidence.
