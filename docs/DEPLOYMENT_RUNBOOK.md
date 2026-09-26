# Deployment Runbook

## Pré-requis

- Node.js 22+
- Vercel CLI (`npm i -g vercel`)
- Supabase project access
- Render project access

## Frontend Deploy (Vercel)

### Otomatik Deploy

Push to `main` branch triggers automatic deployment.

### Manuel Deploy

```bash
npx vercel --prod
```

### Rollback

```bash
npx vercel rollback
```

### Environment Variables

Vercel dashboard → Settings → Environment Variables
Required:

- `VITE_AUTH_PROVIDER=firebase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL`
- `VITE_BILLING_API_URL`

## Backend Deploy (Render)

### Which path deploys

**The pipeline deploys `main`; Render's webhook is a redundant first mover.**
`.github/workflows/render-deploy.yml` runs on every push to `main` and calls
`npm run render:deploy` (`scripts/render-deploy.mjs`), which resolves the pushed commit, reuses
a deploy of that commit when the webhook already started one, triggers
`POST /services/{id}/deploys` with an explicit `commitId` when nothing is arriving, waits for a
terminal status (`live` is the only success), and finally asks the live instance whether it is
healthy and whether its Supabase project matches the one it is pinned to.

Why the pipeline and not just the webhook: **Render never reconciles a lost push.** The
GitHub App delivers a `push` event; when a delivery is dropped, nothing polls the branch, so the
service keeps serving the previous commit while `main` moves on — and no failed deploy, no
event, nothing in the dashboard says so. The service's own deploy history:

| when (UTC)         | `main`   | Render                                                               |
| ------------------ | -------- | -------------------------------------------------------------------- |
| 2026-09-18 10:15   | 2def6f9f | deployed (`new_commit`) — the last automatic deploy                  |
| 2026-09-18 → 09-23 | 8 merges | **nothing**, not even a failed deploy or an event                    |
| 2026-09-23 07:37   | 346d9020 | deployed (`new_commit`) — deliveries working again                   |
| 2026-09-23 09:29   | b2f5f755 | **nothing**; deployed only by hand through the API five hours later |

Those eight were harmless by luck (none touched `backend/`). The frontend never had this
problem because the pipeline deploys it (`.github/workflows/vercel-deploy.yml`); the backend
now has the same property.

The webhook stays on (`autoDeploy: yes`, `autoDeployTrigger: commit`, branch `main`, no build
filter) because when it works it starts the deploy seconds after the push. The command then
finds that deploy and waits on it rather than starting a second one, so one push produces one
deploy and one restart of production regardless of who got there first.

The command audits the service before it touches it — repo, branch and `autoDeploy` — because
those are the settings whose silent drift re-creates the failure above. It needs one credential,
`RENDER_API_KEY` (Render dashboard → Account Settings → API Keys); the workflow reads it from the
repository secret of the same name, and the service is found through the `RENDER_SERVICE_ID`
repository variable or by name when that is unset.

```bash
export RENDER_API_KEY=rnd_…
npm run render:deploy -- --commit <sha>              # deploy that commit and wait until it is live
npm run render:deploy -- --commit <sha> --dry-run    # report only; never POSTs
npm run render:deploy -- --commit <sha> --force      # deploy even if this commit already has one
```

If Render's clone does not have the commit yet (a lost webhook is also a lost fetch, so
`commitId` answers 404), the command deploys the head of `main` instead and then checks that the
deploy it created names the commit it was asked for — a branch that has moved on fails the run
instead of silently shipping a different commit.

### The timer that notices on its own

`Deploy to Render` closes the gap on the way in, but it cannot notice a push that never started
it — the workflow disabled, the API key rotated, GitHub not delivering the `push` event to
Actions either. The `Production Runs main` job in `.github/workflows/health-check.yml` asks the
same question every fifteen minutes and goes red when `main` and production disagree:

```bash
export RENDER_API_KEY=rnd_…
npm run render:check                    # assert the head of main is what is serving traffic
npm run render:check -- --commit <sha>  # assert a specific commit instead
```

It deploys nothing, so it is safe on a timer. A red run is one of three findings:

| Finding | What it means |
| --- | --- |
| `main points at <sha> but production is running <sha>` | nothing landed the commit: check the `Deploy to Render` workflow and its `RENDER_API_KEY` secret, then deploy by hand with `npm run render:deploy` |
| `the live runtime reports no expectedProjectRef` | the Supabase pin was deleted from the service's environment (the blueprint still declares it, so nothing in the repository looks wrong) |
| `resolves Supabase project A while it is pinned to B` | the runtime and the migrations are pointed at different projects |

A commit pushed less than 600 seconds ago is allowed to still be building, which is why the job
is not red for the minute between a merge and its deploy; an older commit fails on the first
pass, so a real drift is reported immediately instead of after a full wait.

### "main moved but production did not"

1. Ask what is live:

   ```bash
   export RENDER_API_KEY=rnd_…
   npm run render:check                                        # read-only, exits 1 on drift
   npm run render:deploy -- --commit "$(git rev-parse origin/main)" --dry-run
   ```

   `is already live` means nothing is wrong. `would be triggered` means `main` is ahead of the
   running backend — continue.
2. Confirm nothing arrived: Render dashboard → the service → **Events**. An empty feed around
   the push time is a dropped delivery, not a failed build.
3. Deploy it: re-run the failed `Deploy to Render` workflow, or
   `npm run render:deploy -- --commit <sha>` from a checkout. The previous version keeps serving
   until the new deploy goes live, so a failed attempt is not an outage.
4. If it keeps happening, check the connection rather than the code: GitHub → **Settings →
   Applications → Render** (is the installation still authorized, and does it still have access
   to this repository?) and Render → the service → **Settings → Build & Deploy** (Auto-Deploy
   `Yes`, branch `main`, the right repository). Re-authorizing the GitHub App is a dashboard
   action; the pipeline deploy above works even while it is broken, which is the point.

### Health Check

```bash
curl https://englishengineer-backend.onrender.com/api/health
# Expected public response: {"status":"ok"}

curl -H "Authorization: Bearer $METRICS_TOKEN" \
  https://englishengineer-backend.onrender.com/api/diagnostics
curl -H "Authorization: Bearer $METRICS_TOKEN" \
  https://englishengineer-backend.onrender.com/api/metrics
```

### Environment Variables

**`render.yaml` is the list.** `npm run verify:render-env` fails the build when the blueprint
and `backend/src` disagree — a variable the code reads that the blueprint omits, and a
variable the blueprint declares that nothing reads — and it refuses a literal value for
anything named KEY/TOKEN/SECRET/PASSWORD/DSN, because those are `sync: false` and their value
belongs in the Render dashboard rather than in git.

The deployed service was configured by hand, so it is not necessarily the blueprint's output.
What the blueprint covers, and what each omission costs:

- `NODE_ENV=production`
- `APP_ORIGIN`, `CORS_ALLOWED_ORIGINS` (the origins the browser is allowed to call from)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; tenant authorization, audit, export and audio storage)
- `EXPECTED_SUPABASE_PROJECT_REF` (the project ref inside `SUPABASE_URL`. With it, a process pointed at a different project refuses to start; without it, production logs a warning on every boot and a misdirected migration only ever appears as "writes fail" behind a green `/api/health`. See the section below)
- `SUPABASE_ANON_KEY` (read alongside the service key for local Supabase JWT verification)
- `METRICS_TOKEN` (required; `/api/metrics` and `/api/diagnostics` answer 401 without it, and diagnostics is the only view of the audit store's real state)
- `FIREBASE_PROJECT_ID` (non-secret; ID tokens are verified against Google's public JWKS, so no service-account key is needed — and nothing reads one)
- `SPEAKING_AUDIO_BUCKET` (private Supabase Storage bucket; defaults to `speaking-audio`)
- `BILLING_PROVIDER=dodo` (the code default is `stripe`, which this deployment does not sell: `/api/webhooks/dodo` would answer 404 while the live service serves it)
- `BILLING_REPOSITORY=supabase` (`memory` loses every paid subscription on restart)
- `DODO_PAYMENTS_API_KEY`
- `DODO_PAYMENTS_WEBHOOK_KEY` (the name the code reads, `config-builders.ts:164`; a service configured with `…_WEBHOOK_SECRET` instead leaves `webhookSecret` null, and `processWebhook` refuses every delivery with 503 `dodo_webhook_not_configured` — `dodo-billing-provider.ts:440`. It fails closed, so nothing is granted on a forged signature, but a real payment then never activates its plan: the customer is charged at checkout and stays on Free)
- `DODO_PRODUCT_JUNIOR_MONTHLY` … `DODO_PRODUCT_TEAM_ANNUAL` and `DODO_PRODUCT_TOPUP` (eleven ids: five plans × monthly/annual, plus the credit top-up; a missing one is a 503 on that plan's checkout and nothing else notices)
- `DODO_PAYMENTS_ENVIRONMENT=live` (`test` points checkout at `test.dodopayments.com` while the live key stays in place, and the two only fail at the provider with a 401 nobody reads)
- `RATE_LIMIT_STORE=upstash` + `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (in production the store defaults to `upstash` and `validateRateLimitStore` throws when it is unconfigured, so a service missing these never finishes starting — this is not a degraded mode)
- `AI_PROVIDER` and the key for that provider (`GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`; `AI_PROVIDER` defaults to `mock`, which answers with canned text and makes `/api/health` report `mockMode: true`)
- `SENTRY_DSN` (optional; without it `initSentryIfConfigured` is a no-op)

Deliberately absent, with the reason — the same text `npm run verify:render-env` prints:
`SUPABASE_JWT_*` (only for local Supabase JWT verification, which this service does not use),
`ENGINEEROS_INTERNAL_*` (internal service authentication is off), `STRIPE_*` (the inactive
provider), `ALLOW_*` (development escape hatches — setting one here switches a production
safety check off), and the tuning variables whose code default is the intended value —
`AI_LEDGER_FILE` among them: AI kullanım ledger'ının NDJSON dosya yolu; ayarlanmazsa ve
Supabase yapılandırılmamışsa in-memory ledger kullanılır (kalıcılık yok).

## Which Supabase project is production

`SUPABASE_URL` on the backend and `VITE_DATA_CDN_URL` on the frontend are the two places that
name the project, and they are the only authoritative answer. As of 2026-09-22 the backend's
value is:

|            | project                                                   | why                                                                                                                                                       |
| ---------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| production | **`yljpagmnjhclieqjthdx`** (`supabase-aureolin-mountain`) | the account that owns it can administer it                                                                                                                |
| former     | `wxabrwzitwsjtpmlvvqe`                                    | holds the pre-move copy of the data and the content bucket; nobody could reach its account, so it could be paused or deleted by a third party at any time |

`/api/health` and `/api/diagnostics` both report `checks.supabase.projectRef` (the resolved
project) and `checks.supabase.expectedProjectRef` (the pinned one) from the same
`backend/src/store-health.ts`, so the two endpoints cannot name different databases — with
`reachable: null` on the liveness path meaning "not probed" rather than "healthy".

Set `EXPECTED_SUPABASE_PROJECT_REF` to **`yljpagmnjhclieqjthdx`**. With it, a backend whose
`SUPABASE_URL` points somewhere else **refuses to start** (`backend/src/app.ts`, next to the
`FIREBASE_PROJECT_ID` guard) instead of reading and writing another project's tables — the exact
shape of the 2026-09-19 incident, where a migration applied to the dashboard's default project
reported success while the running backend kept failing against a different one. Outside
production a mismatch is a warning, and an unset pin never blocks a boot.

The move carried the schema (every file in `supabase/migrations`, applied in filename order),
the 107 rows that existed (46 `audit_logs`, 45 `stripe_processed_events`, 16
`subscription_status`) and the `app-data` bucket (31 objects, 82 MB). It deliberately did **not**
carry `user_progress_snapshots` (60 rows): its `user_id` is a uuid with a foreign key into
`auth.users`, so those rows belong to the pre-Firebase identity model and no live code can read
or write them — the app signs users in with Firebase, whose ids are not uuids. They remain in the
former project.

**Both projects carry the same schema, which is the trap this section exists for.** Applying a
migration to the wrong one answers `Success. No rows returned` and changes nothing about the
running service. Before applying anything, ask the database which one it is — the backend answers
with `checks.supabase.projectRef` on `/api/health`, and `npm run apply:schema-identity` prints the
project name and the row count of every table it tracks before it writes.

## Database Migrations (Supabase)

**No deploy step applies `supabase/migrations`.** Neither Vercel, Render, nor any workflow in
`.github/workflows/` runs them against the project database — this repository keeps them as
reviewed SQL, and an operator applies them. A migration that has not been applied by hand is a
migration that does not exist at runtime, however green the branch is.

### Apply

The identity columns have a command of their own, which reports what it found, converts only
what is wrong, and re-reads the database to prove it:

```bash
# A token needs no database password and no Docker: it goes through Supabase's own API.
export SUPABASE_ACCESS_TOKEN=sbp_…          # Account → Access Tokens; full access, all projects
export SUPABASE_PROJECT_REF=<project-ref>   # or let SUPABASE_URL / VITE_DATA_CDN_URL supply it
npm run apply:schema-identity -- --check    # report only; changes nothing; non-zero if wrong
npm run apply:schema-identity               # convert in one transaction, then verify
```

Without a token it falls back to a connection string — `POSTGRES_URL_NON_POOLING`, then
`SUPABASE_DB_URL`, then `DATABASE_URL`, then `POSTGRES_URL` — and needs `psql` or Docker. It
prefers the **direct** connection string (port 5432) over the pooler. Its conversion is the same
`drop constraint` + `alter column … type text using …::text` that `202609190001` and
`202609210000` perform, so applying either one is enough; both are idempotent and neither loses
a row.

**Read the first lines of its output before trusting the rest.** It prints the project ref and
name and the row count of every table it tracks, because the wrong database is easy to reach and
hard to notice: a second Supabase project with the same schema (a Vercel integration creates one)
accepts every statement, answers `Success. No rows returned`, changes nothing, and leaves
checkout broken. Empty counts on tables that should hold data mean the command is pointed at the
wrong project — fix that before applying anything.

The set applies to an empty project end to end as of 2026-09-22; three files had to be corrected
first, and each one had been failing on every fresh environment without anyone noticing:
`add_performance_indexes.sql` indexed `audit_logs(created_at)` (the column is `timestamp`),
`202607100003_rls_tightening.sql` dropped a policy on `public.workspaces` before any migration
created that table, and the same file declared owner-select policies on the two billing tables
whose `user_id` becomes `text` — a comparison that cannot be made once the identity conversion has
run, and which `202609210000` removes anyway.

Every other migration still goes by hand:

1. Supabase dashboard → SQL Editor (production project), then run the new files from
   `supabase/migrations/` in filename order. Only the files not yet applied; each is written to
   be idempotent, but order is what makes a `create table` and the `alter table` that corrects it
   land in the right sequence.
2. Verify the column types the runtime actually writes. Every one of these must be `text`:

   ```sql
   select table_name, column_name, data_type, is_nullable
   from information_schema.columns
   where table_schema = 'public'
     and ((table_name = 'audit_logs'               and column_name = 'user_id')
       or (table_name = 'subscription_status'      and column_name = 'user_id')
       or (table_name = 'billing_customers'        and column_name = 'user_id')
       or (table_name = 'ai_credit_consumptions'   and column_name = 'user_id'));
   ```

   These columns carry the Firebase uid (`payload.sub`, an opaque string). A `uuid` column, or a
   foreign key into `auth.users`, rejects it at the first write and fails the audited action
   closed — which reaches the customer as billing being unavailable, not as a schema error.

3. Confirm the same statically before pushing: `npm run verify:schema-identity` reads the
   migrations and fails on a `uuid` identity column. CI runs it in the Code Quality job.

### Why the column type reaches the customer

`audit_logs` sits in front of checkout: `backend/src/audit-log.ts` fails an audited action closed
when the store cannot be written, returning 503 `audit_log_unavailable`. That is correct, and it
means a wrong column type in the audit store is indistinguishable, from the customer's side, from
a billing outage. `/api/health` still answers 200, the pricing page still renders, and the
provider keys can all be right.

## Post-Deploy Checklist

- [ ] The `Deploy to Render` workflow is green for `main` HEAD — it only goes green once that
      commit is the one serving traffic, so this replaces "did the webhook fire?"
- [ ] `npm run render:check` passes (or the `Production Runs main` job is green), which also
      proves the Supabase pin is still set on the service
- [ ] Frontend loads (https://eng-vox.vercel.app)
- [ ] Public backend liveness returns only `status: ok`
- [ ] Authenticated diagnostics returns 200 and reports audit status `ready`
- [ ] Metrics rejects missing/query tokens and accepts the Bearer token
- [ ] Production speaking upload rejects local storage fallback
- [ ] Starting a checkout reaches the provider's hosted page (the audit store is in front of
      checkout, so this is the only check that proves the identity columns are correct)
- [ ] Login page loads
- [ ] Google OAuth redirects correctly
- [ ] API endpoints respond
- [ ] Sentry captures errors (if configured)

## Firebase Auth

### Production configuration

- Frontend requires `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_AUTH_DOMAIN` and optionally `VITE_FIREBASE_APP_ID`.
- Backend requires `FIREBASE_PROJECT_ID`; bearer tokens are verified against
  Firebase public keys and the configured project audience.
- Email/Password must be enabled in Firebase Authentication. Google sign-in
  additionally requires the deployed domains in Authorized domains and the
  Android SHA-1/SHA-256 fingerprints documented in `MOBILE.md`.
- Never place Firebase Admin private keys in `VITE_*` variables. Browser API
  keys are public identifiers; project restrictions and Security Rules enforce
  access.

### Post-deploy auth verification

1. Open `/login` and verify Email/Password and Google entry points render.
2. Sign in with a dedicated production-smoke account and confirm `/dashboard`
   survives a reload.
3. Call one protected backend endpoint with the Firebase ID token and verify
   the backend rejects expired, wrong-project and malformed tokens.
4. Sign out and confirm protected routes redirect back to `/login` and stale
   backend token getters are cleared.

### Playwright test-project configuration

Authenticated E2E suites require a dedicated Firebase test project and the
following CI secrets: `VITE_FIREBASE_API_KEY`, `FIREBASE_E2E_TEST_EMAIL` and
`FIREBASE_E2E_TEST_PASSWORD`. The setup creates/reuses only that test account,
signs in through the real app UI and stores Firebase IndexedDB state. Forks or
local runs without these values skip only authenticated suites; the public
smoke suite remains mandatory.

## AI Analytics & Prompt Telemetry

### Endpoints (auth + rate-limit korumalı)

- `GET /api/v1/ai/analytics` (legacy: `/api/ai/analytics`) — oturum açan kullanıcının AI tüketim özeti + kota durumu (`planId`, `limits.used/remaining/daily/monthly`, `byOperation`, `byDay`, `estimatedCostUsd`).
- `GET /api/v1/ai/analytics/admin` — yalnızca `admin` rolü. Tüm kullanıcıların toplam istek/token/tahmini maliyeti, `topUsers` ve `promptVersionUsage` telemetrisi (bundled dosya vs DB kaynağı, drift/uyumsuzluk sayacı).

### Kota

Plan bazlı günlük (free: 3/gün) veya aylık (ücretli) AI limitleri `backend/src/ai.ts` `PLAN_AI_LIMITS` üzerinden zorlanır. Limit dolunca `429` döner; UI'da kotanın kalan kısmı Kişisel AI panelindeki "AI Kullanım Analitiği" kartında gösterilir.

### Ledger kalıcılığı

- Supabase yapılandırılmışsa `ai_sessions` tablosu kullanılır.
- Değilse: `AI_LEDGER_FILE` set edildiyse NDJSON dosya ledger'ı (restart'a dayanır), yoksa in-memory ledger.
- `prompt-version.json` manifesti, structured operasyonların (`json-structure`, `content-generation`) servis ettiği prompt sürümünü izler; uyumsuzluk (`@db` kaynak veya farklı sürüm) telemetride sayılır.

## Incident Response

### Frontend Down

1. Check Vercel status: https://vercelstatus.com
2. Check build logs in Vercel dashboard
3. Rollback if needed: `npx vercel rollback`

### Backend Down

1. Check Render status: https://status.render.com
2. Check health endpoint
3. Check logs in Render dashboard
4. Restart service if needed

### Auth Issues

1. Verify Supabase project status
2. Check env vars are set correctly
3. Verify redirect URLs in Supabase dashboard

### "Billing could not be started because the service is temporarily unavailable. Please try again in a few minutes."

This sentence is generic on purpose: `src/features/billing/billing.failure-copy.ts` renders it for a
failure it cannot tie to copy of its own — including `audit_log_unavailable`, which is the one that
reaches customers while everything else looks healthy. "Try again in a few minutes" is therefore
not always true, and it is never the whole story. Find the code rather than retrying.

1. **Get the backend's error code.** Look in the browser's network tab for the failing billing
   request (create-checkout / customer-portal / top-up) and read `error.code` in the response body.
   The frontend receives it as `apiCode`; the sentence alone does not identify the cause.
   - `audit_log_unavailable` → the audit store refused the write, and the audited action failed
     closed in front of checkout. Go to step 2.
   - `idempotency_store_unavailable` → the Redis/Upstash rate-limit or idempotency store is down.
     Check `RATE_LIMIT_STORE`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
   - `STRIPE_NOT_CONFIGURED` / `dodo_not_configured` / `STRIPE_PRICE_NOT_CONFIGURED` → provider
     keys or price ids are missing. Check `DODO_PAYMENTS_API_KEY` and the plan price ids.
   - no code at all → the failure never reached the backend's error envelope; check
     `VITE_BILLING_API_URL` and the client console, which logs the unclassified failure in
     development builds only.
2. **Confirm the audit store** (this is the failure that hides behind a green `/api/health`):

   ```bash
   curl -H "Authorization: Bearer $METRICS_TOKEN" \
     https://englishengineer-backend.onrender.com/api/diagnostics
   ```

   `audit.status` must be `ready`. `degraded` or `unavailable` with a `22P02` in the Render logs is
   the identity mismatch below, not an outage.

3. **Check the identity columns** — run the `select` from [Database Migrations](#database-migrations-supabase).
   A `uuid` `user_id` in `audit_logs`, `subscription_status`, `billing_customers` or
   `ai_credit_consumptions` means a migration was never applied; apply it, then re-run step 2. The
   audit store recovers on its own on the next request, so a redeploy is not required.
4. **Only then** treat it as a real outage: if diagnostics reports `audit.status: ready`, the
   columns are `text` and the code is `audit_log_unavailable`, the store itself is unreachable —
   check Supabase status and `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` on Render.
