# PRC Kademe 8 Live Service Evidence Report

## Evidence Decision

**PARTIAL**

At least one real staging or quality check was not verified. No failed check is reported as passed.

## Locally Verified Evidence

- The verifier loads supported environment files and process variables without printing values.
- Required modes and Stripe test-mode configuration are validated before any live request.
- Secret-pattern scan: **PASS (0 high-confidence findings)**.
- Environment ignore coverage: **PASS**.
- Static Supabase RLS and local service behavior remain covered by the project quality scripts.

## Browser Verified Evidence

- Browser quality gate: **NOT RUN IN THIS VERIFICATION**.

## Staging Verified Evidence

- Supabase two-user authentication: **PASS**
- Supabase session restore: **PASS**
- Supabase cloud snapshot save/load: **PASS**
- Supabase live RLS isolation across private tables: **PASS**
- Stripe backend configuration: **PASS**
- Stripe test-mode Checkout Session: **PASS**
- Stripe test-mode Customer Portal: **PASS**
- Supabase logout: **PASS**

The report never treats Stripe Dashboard/CLI delivery, provider-failure injection, or service dashboards as verified unless those actions actually ran.

## Not Yet Verified Evidence

- Supabase staging signup/login/session/logout and two-user RLS isolation.
- Cloud snapshot save/load against staging.
- Cloud-to-local restore against a real staging account.
- Live offline/failure recovery against staging.
- Stripe test-mode Checkout, Customer Portal, webhook and entitlement update.
- Real AI request through the deployed backend proxy.
- Upstash REST availability and shared counter behavior.

## Redacted Environment Availability

| Variable                    | Scope    | Requirement | Availability |
| --------------------------- | -------- | ----------- | ------------ |
| `VITE_AUTH_PROVIDER`        | frontend | required    | OK           |
| `VITE_SUPABASE_URL`         | frontend | required    | OK           |
| `VITE_SUPABASE_ANON_KEY`    | frontend | required    | OK           |
| `VITE_BILLING_API_URL`      | frontend | required    | OK           |
| `VITE_AI_PROVIDER`          | frontend | required    | OK           |
| `VITE_AI_PROXY_URL`         | frontend | required    | OK           |
| `SUPABASE_URL`              | backend  | required    | OK           |
| `SUPABASE_ANON_KEY`         | backend  | required    | OK           |
| `SUPABASE_SERVICE_ROLE_KEY` | backend  | required    | OK           |
| `BILLING_REPOSITORY`        | backend  | required    | OK           |
| `STRIPE_SECRET_KEY`         | backend  | required    | OK           |
| `STRIPE_WEBHOOK_SECRET`     | backend  | required    | OK           |
| `STRIPE_PRICE_PRO_MONTHLY`  | backend  | required    | OK           |
| `AI_PROVIDER`               | backend  | required    | OK           |
| `OPENAI_API_KEY`            | backend  | optional    | MISSING      |
| `ANTHROPIC_API_KEY`         | backend  | optional    | MISSING      |
| `GEMINI_API_KEY`            | backend  | required    | OK           |
| `RATE_LIMIT_STORE`          | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_URL`    | backend  | required    | OK           |
| `UPSTASH_REDIS_REST_TOKEN`  | backend  | required    | OK           |

Only availability is shown. No value, token, key or secret is written to this report.

## Commands Run

No quality commands were run because live prerequisites were blocked.

The external invocation required for this report is `npm run kademe8:verify`.

## Security Check

- `.env`, `.env.local`, `.env.production` and `.env.*.local` are ignored by repository rules.
- No high-confidence committed secret pattern was found.
- Secret values were not printed to terminal output or markdown.
- Live checks accept only Stripe test-mode credentials.

## Remaining Blockers

- None.

## Next Decision

**Kademe 9 live release: FORBIDDEN until Kademe 8 has real passing staging evidence.**

- Production launch: **NOT ALLOWED.**
- Live billing: **NOT ALLOWED.**
- Kademe 9-13 code-only implementation: **ALLOWED; this does not create live evidence.**
