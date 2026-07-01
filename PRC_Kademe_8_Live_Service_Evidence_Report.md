# PRC Kademe 8 Live Service Evidence Report

## Overall Verdict

**BLOCKED**

Deployment credentials required. Local product, build, backend and browser
quality gates pass, but the ordered live-service sequence cannot begin until a
Railway staging backend exists. No live evidence was fabricated and no secret
value was printed.

## Service Evidence

| Service           | Status  | Evidence                                                                    |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| Railway backend   | BLOCKED | CLI unavailable; URL not assigned; health not tested live                   |
| Vercel frontend   | BLOCKED | CLI authenticated; no project exists; deployment not created before Railway |
| Stripe TEST       | BLOCKED | CLI unavailable; checkout, portal, webhook and sync not tested live         |
| Supabase staging  | BLOCKED | CLI unavailable; migrations and multi-user RLS not tested live              |
| AI backend proxy  | BLOCKED | No Railway URL; real provider request not sent                              |
| Upstash           | BLOCKED | No Railway deployment; shared live 429 proof not run                        |
| Legal and support | HOLD    | Template pages exist; legal approval and public contacts are pending        |

Timestamp: **2026-07-01, Africa/Tripoli**.

## Redacted Environment Availability

| Variable                    | Scope    | Availability       |
| --------------------------- | -------- | ------------------ |
| `VITE_AUTH_PROVIDER`        | frontend | OK                 |
| `VITE_SUPABASE_URL`         | frontend | OK                 |
| `VITE_SUPABASE_ANON_KEY`    | frontend | OK                 |
| `VITE_BILLING_API_URL`      | frontend | PLACEHOLDER        |
| `VITE_AI_PROVIDER`          | frontend | OK                 |
| `VITE_AI_PROXY_URL`         | frontend | PLACEHOLDER        |
| `SUPABASE_URL`              | backend  | OK                 |
| `SUPABASE_ANON_KEY`         | backend  | OK                 |
| `SUPABASE_SERVICE_ROLE_KEY` | backend  | OK                 |
| `BILLING_REPOSITORY`        | backend  | OK                 |
| `STRIPE_SECRET_KEY`         | backend  | OK                 |
| `STRIPE_WEBHOOK_SECRET`     | backend  | OK                 |
| `STRIPE_PRICE_PRO_MONTHLY`  | backend  | OK                 |
| `AI_PROVIDER`               | backend  | OK                 |
| `OPENAI_API_KEY`            | backend  | OK                 |
| `ANTHROPIC_API_KEY`         | backend  | MISSING (optional) |
| `RATE_LIMIT_STORE`          | backend  | OK                 |
| `UPSTASH_REDIS_REST_URL`    | backend  | OK                 |
| `UPSTASH_REDIS_REST_TOKEN`  | backend  | OK                 |

Only availability is shown. Values, tokens, keys and secrets are omitted.

## Quality Evidence

| Command                        | Exit code | Result                  |
| ------------------------------ | --------: | ----------------------- |
| `npm run format:check`         |         0 | PASS                    |
| `npm run typecheck`            |         0 | PASS                    |
| `npm test`                     |         0 | PASS, 237 tests         |
| `npm run build`                |         0 | PASS                    |
| `npm run quality:gate`         |         0 | PASS                    |
| `npm run quality:gate:browser` |         0 | PASS, 11 Chromium tests |
| `npm run verify:release`       |         0 | PASS                    |
| `npm run verify:rls`           |         0 | PASS, static only       |
| `npm run kademe8:check`        |         0 | BLOCKED_ENV_CHECK       |
| `npm run kademe8:verify`       |         2 | BLOCKED                 |
| `npm run test:coverage`        |         0 | PASS, 257 scenarios     |

The first browser run identified two UI contract mismatches. They were fixed,
and the complete quality plus browser chain was rerun successfully.

## Build and Coverage

- Main application JavaScript: **420.45 kB minified / 128.60 kB gzip**.
- Statements: **51.72%**.
- Branches: **40.09%**.
- Functions: **46.61%**.
- Lines: **52.88%**.
- Large vocabulary and grammar datasets remain dynamically split by CEFR
  level; some data chunks exceed 500 kB minified.

## Security

- Secret-pattern scan: **PASS, 0 high-confidence findings**.
- Environment ignore coverage: **PASS**.
- Live checks accept Stripe TEST mode only.
- No AI, Stripe, Supabase service-role or Upstash secret is placed in frontend
  configuration.

## Release Decision

- Kademe 8: **BLOCKED**
- Closed beta: **GO**
- Public SaaS: **HOLD**
- Production launch: **NO**
- Stripe TEST billing: **BLOCKED**
- Live billing: **NO**

## Remaining Blockers

1. Deploy `backend/` to Railway staging and verify `/api/health`.
2. Replace the two frontend placeholder URLs with the Railway endpoints.
3. Complete Stripe TEST checkout, portal, signed webhook and entitlement sync.
4. Apply Supabase staging migrations and prove two-learner plus manager RLS.
5. Verify one real backend-only AI request and shared Upstash rate limiting.
6. Obtain legal review and publish verified support and sales contacts.

The next exact action is step 1 in
`PRC_Kademe_8_Live_Operator_Checklist.md`.
