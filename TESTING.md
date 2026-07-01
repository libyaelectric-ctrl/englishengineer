# EngineerOS Test Suite & Quality Gate

## PRC Kademe 7 browser proof

Chromium installation and real browser execution are part of the controlled
beta gate:

```bash
npm run e2e:browser:install
npm run e2e:browser
npm run quality:gate:browser
```

The current suite contains 11 real Chromium scenarios. It covers local demo
authentication, dashboard/session persistence, Reading, Writing, Listening,
Speaking typed fallback, Vocabulary, Grammar, Assessment, AI/backend failure
states, Profile/Billing, offline and corrupted-storage resilience, keyboard
focus, light UI hover behavior and responsive navigation.

Mobile validation uses a 390 × 844 viewport and proves no horizontal overflow,
an off-canvas closed sidebar and a dismissible menu. Tablet validation uses an
820 × 1180 viewport. Tests use local/demo providers and require no production
secret.

## v4.0.1 bounded exit evidence

`npm run verify:test-exit` gives the normal unit-test command a 90-second external deadline, `npm run verify:build-exit` gives the production build 120 seconds, and `npm run verify:quality-exit` gives the complete quality gate 240 seconds. These commands expose lifecycle hangs without modifying command success behavior. Unit tests use two controlled Vitest thread workers so the complete suite exits inside the existing deadline without unbounded JSDOM concurrency.

`npm run quality:gate` uses `scripts/quality-gate.mjs`, not a long shell chain. To avoid nested npm lifecycle instability, its frontend-test step launches the project-local `vitest.mjs` directly with Node under a 90-second timeout; it does not call `npm run verify:test-exit` internally. The orchestrator runs install, static checks, tests/build, E2E, backend checks, release verification, and RLS verification in separate sequential child processes. It inherits output and throws immediately on any startup error, timeout, signal, or non-zero exit.

`npm run e2e:browser` requires an installed Playwright Chromium executable. Install it explicitly with `npm run e2e:browser:install`. If the executable is missing, report browser E2E as not verified; do not report it as passed or as an application logic failure.

Pure TypeScript calculation and contract tests declare the Node environment directly. Only UI, browser storage, audio-store, and page tests use JSDOM. The shared setup conditionally loads Testing Library in JSDOM and keeps mock/timer cleanup safe in both environments. This avoids paying JSDOM startup and teardown costs for pure logic tests.

Current source version: **v4.0.1**. CI installs Chromium with
`npx playwright install --with-deps chromium` before browser verification.

## Purpose

Sprint 17 introduces an automated testing foundation for EngineerOS. The goal is regression protection for business logic, calculations, parsers and infrastructure helpers without changing product behavior.

The suite prioritizes meaningful scenarios over raw percentage coverage.

## Stack

- Vitest
- V8 coverage provider
- jsdom test environment
- Testing Library and jest-dom are installed for future component tests where UI behavior needs verification
- Playwright browser tests for real Chromium release verification

## Commands

```bash
npm test
npm run e2e
npm run e2e:browser
npm run test:watch
npm run test:coverage
npm run build
npm --prefix backend test
```

The backend contract suite uses Node's built-in test runner and covers health
safety, missing configuration, AI validation/mock/real/error states, Stripe
configuration errors, webhook signatures, idempotency, and subscription
status states.

Vitest uses `--configLoader runner` because this Windows workspace blocks the default bundled config loader from reading parent directories.

## Folder Structure

Tests live next to the modules they protect:

```text
src/features/ai/backend-proxy.provider.test.ts
src/features/analytics/analytics.calculations.test.ts
src/features/auth/cloud-sync.service.test.ts
src/features/billing/billing.entitlements.test.ts
src/features/gamification/gamification.helpers.test.ts
src/features/gamification/gamification.service.test.ts
src/features/vocabulary/vocabulary.helpers.test.ts
src/core/learning/learning.services.test.ts
src/test/fixtures.ts
```

This keeps tests close to the architecture they protect and avoids a disconnected test-only mirror structure.

## Coverage Areas

Current suite:

- AI backend response parsing, malformed responses and HTTP error mapping
- Analytics CEFR, trend, skill radar, study consistency and improvement velocity
- Gamification levels, mission progress and bonus calculations
- Vocabulary normalization, exact correctness, due review sorting and evaluator output
- Cloud sync merge conflict behavior
- Billing subscription and feature entitlement edge cases
- Learning scoring and achievement unlock logic

## How To Add New Tests

1. Prefer pure functions and services first.
2. Put `*.test.ts` beside the feature file under test.
3. Use typed fixtures from `src/test/fixtures.ts` when a full learning state is needed.
4. Avoid testing implementation trivia such as CSS classes unless the class carries functional meaning.
5. Add edge cases for malformed inputs, empty state, offline-like state and subscription boundaries.

## Coverage Philosophy

EngineerOS coverage should grow around release risk:

- High priority: parsers, scoring, entitlements, sync merge logic, analytics calculations
- Medium priority: stores and provider adapters
- Lower priority: static page layout unless interactions become complex

The current target is 30-40 meaningful scenarios; Sprint 17 ships 48 scenarios. Percentage coverage is expected to be modest because pages, large datasets and UI shells are intentionally not the first testing target.

## Regression Strategy

Before production release, every sprint should run:

```bash
npm test
npm run test:coverage
npm run build
```

Future quality gates should add:

- Route smoke tests
- Auth adapter tests with mocked Supabase client
- Billing provider tests with mocked fetch timeout and backend failures
- Component tests for upgrade prompts and form flows
- End-to-end tests for login, learning completion and subscription refresh

## Release Candidate E2E Smoke Tests

Sprint D adds `npm run e2e`.

Current implementation:

- `src/e2e/release-candidate.e2e.test.tsx`
- Vitest + jsdom + React Testing Library
- 20 release-candidate smoke scenarios

Covered scenarios include app routing, local demo login, Supabase fallback, Reading/Writing/Listening/Speaking/Vocabulary flows, assessment data state, AI mock mode, backend unavailable states, billing fallback, profile update, local persistence, mobile viewport smoke, and error boundary smoke.

## Project Olympus Browser E2E

v2.6.0 adds `npm run e2e:browser` with Playwright and real Chromium.

Current browser scenarios cover application startup, local demo authentication,
dashboard restore, refresh persistence, logout,
Reading/Writing/Listening/Speaking/Vocabulary/Grammar route loading, Assessment
limited-data state, AI mock/backend status, profile update, billing fallback
state, backend unavailable, audio unavailable, speech recognition unavailable,
offline mode, corrupted local storage resilience, desktop/tablet/mobile
viewports, keyboard focus and horizontal-overflow checks.

Playwright browsers must be installed in CI or local environments with:

```bash
npx playwright install chromium
```
