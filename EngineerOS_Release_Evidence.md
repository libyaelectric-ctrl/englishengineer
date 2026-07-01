# EngineerOS v2.6.0 Release Evidence

## Evidence Status

State: HOLD for public production launch.

EngineerOS v2.6.0 is verified as a production-quality frontend candidate for closed beta and staging integration. Deployment credentials required before public SaaS launch.

## Required Command Evidence

```text
npm ci
added 308 packages, and audited 309 packages in 10s
found 0 vulnerabilities

npm run typecheck
passed

npm run format:check
All matched files use Prettier code style!

npm run lint
passed

npm run test
16 test files passed
104 tests passed

npm run build
build passed
main chunk: 245.04 kB, gzip 76.99 kB

npm run e2e
1 test file passed
20 tests passed

npm run e2e:browser
6 Chromium browser tests passed
```

## Browser E2E Results

Playwright project: `chromium-desktop`

Passing browser scenarios:

- Application startup, authentication, dashboard, persistence and logout
- Core learning routes through authenticated shell
- Assessment, AI backend status, profile update and billing state
- Network/backend/audio/speech/offline/corrupted-storage resilience
- Desktop, tablet and mobile viewport navigation
- Keyboard focus and primary controls

## Bundle Evidence

Largest production chunks:

- `index-Betere2m.js`: 245.04 kB, gzip 76.99 kB
- `supabase-dIChsWQP.js`: 212.42 kB, gzip 54.95 kB
- `ui-CvUKGdcm.js`: 131.55 kB, gzip 39.77 kB
- `vocabulary.store-DE9K5YzT.js`: 123.81 kB, gzip 35.93 kB
- `ListeningPage-CLqsVEve.js`: 108.13 kB, gzip 31.02 kB

Main bundle target: under 450 kB if practical.

Result: Met.

## Environment Requirements

Required for production:

- `VITE_APP_VERSION=2.6.0`
- `VITE_ENVIRONMENT_MODE=production`
- `VITE_AI_PROVIDER=backend`
- `VITE_AI_PROXY_URL`
- `VITE_AUTH_PROVIDER=supabase`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BILLING_API_URL`

Optional:

- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_ERROR_MONITORING_PROVIDER`
- `VITE_SENTRY_DSN`
- `VITE_ERROR_MONITORING_SAMPLE_RATE`

No frontend secrets are required or allowed.

## Limitations

- Real AI vendor credentials must remain server-side.
- Stripe webhook verification must run on the backend.
- Supabase RLS must be verified against a live project before public launch.
- Browser testing currently covers Chromium only.
- Full screen reader and contrast audits remain manual production tasks.

## Artifact List

- Source package: `engineeros-v2.6.0-olympus-clean-source.zip`
- Production verification report: `EngineerOS_Production_Verification_Report.md`
- Release evidence: `EngineerOS_Release_Evidence.md`
- Test summary: `EngineerOS_Test_Summary.md`
