# EngineerOS v4.0.1 Backend Three Fixes Repair Report

## Status

The repair targets a **94-95/100 controlled paid beta candidate** only if the final bounded quality gate completes. This is not a public SaaS readiness claim.

## Files changed

- `backend/src/rate-limit.js`
- `backend/test/backend.test.js`
- `backend/test/rate-limit.test.js`
- `vitest.config.ts`
- `package.json`
- `SECURITY_HARDENING_NOTES.md`
- `BACKEND_AI.md`
- `backend/README.md`
- `TESTING.md`
- `EngineerOS_v4_0_1_Final_Gate_Fix_Report.md`
- `scripts/verify-release.mjs`
- `EngineerOS_v4_0_1_Backend_Three_Fixes_Repair_Report.md`

## OpenAI strategy and backend test repair

Chat Completions is the single selected strategy. The backend calls `POST /v1/chat/completions`, sends `messages: [{ role: 'user', content: prompt }]`, and parses `choices[0].message.content`.

The backend failure was caused by a stale test mock returning the old Responses API field `output_text`. The mock now returns a Chat Completions `choices` array. The test also verifies the exact endpoint and request body, preventing the two contracts from drifting again.

## Test exit repair

No test-owned timer, listener, user-event, observer, or fetch handle was found. Independent behavior pointed to multi-process Vitest fork teardown. The suite now uses one `threads` worker, while existing global cleanup remains active.

Two consecutive `npm run verify:test-exit` runs completed naturally with summaries and exit code `0`: 52.91 seconds and 47.57 seconds. Each run passed 29 files and 137 tests under the 90-second deadline. No forced `process.exit`, skipped test, or removed test is used.

## Build exit

`npm run verify:build-exit` completed naturally under the 120-second deadline. Vite transformed 2,309 modules, printed the final bundle summary, and exited `0` in 3.47 seconds.

## Bounded rate limiter

The rate limiter now accepts `maxBuckets` and `pruneIntervalMs` defaults. It resets an expired current bucket, periodically removes expired entries, prunes before capacity pressure, and evicts oldest live entries until the hard maximum is respected. Existing 429 behavior and rate-limit headers remain unchanged.

Four tests verify headers/429, current-key expiry, periodic pruning, and oldest-entry eviction at the hard cap.

## Stripe raw body verification

The dedicated raw Stripe router remains before JSON middleware. Existing backend tests verify that the webhook handler receives a `Buffer`, invalid signatures are rejected, valid events are accepted, and duplicate event ids are idempotent.

## Supabase billing verification

The Supabase repository remains intact. Tests verify subscription get/upsert, processed-event get/mark, persistence errors, production selection, and memory-repository rejection. Static RLS verification includes `stripe_processed_events` and its service-role boundary. No live Supabase claim is made.

## Final command evidence

All required commands completed with exit code `0`:

- `npm ci`: 308 packages installed; 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npm run verify:test-exit`: final individual run passed 29 files and 137 tests in 52.60 seconds, below the 90-second deadline. Two earlier consecutive verification runs also exited `0` in 52.91 and 47.57 seconds.
- `npm run verify:build-exit`: Vite transformed 2,309 modules, printed its bundle summary, and exited `0` in 3.87 seconds during the final individual gate, below the 120-second deadline.
- `npm run e2e`: 20 tests passed.
- `npm run backend:install`: 71 packages installed; 0 vulnerabilities.
- `npm run backend:test`: 33 tests passed, including Chat Completions, rate-limit, Stripe raw body, and Supabase repository coverage.
- `npm run verify:release`: passed with 13 WAV assets and preserved content counts.
- `npm run verify:rls`: passed, including Stripe processed events and service-role checks.
- `npm run verify:quality-exit`: the complete quality gate exited `0` in 87.8 seconds, below the 180-second deadline. Its unit-test phase completed in 51.30 seconds.
- `npm run e2e:browser`: Chromium was installed in this environment; 9 tests passed in 48.7 seconds.

With every acceptance command green, the honest recommendation is **95/100 controlled paid beta candidate**. Public SaaS readiness is not claimed.

## Remaining limitations

- Live Supabase migration and isolation proof require staging credentials.
- Live Stripe checkout, portal, and signed webhook proof require Stripe test credentials.
- Live AI provider proof requires backend-only credentials.
- Deployment and monitoring evidence remain required for public SaaS readiness.
