# Changelog

## v4.0.1 - Learning Flow, UI and Content Polish

- Added a visible, sequential A1-to-C2 level model with honest confidence states.
- Reset demo and first-use level assumptions to A1 unless calibrated evidence exists.
- Softened the light UI, stabilized contextual panels and completed feedback/speaking-result fixes.
- Expanded professional Work Tools, Quick Tools and their regression coverage.
- Strengthened role-aware Learning Intelligence, offline honesty and release evidence checks.

## v4.0.0 - Full Sprint Execution

- Added Work Tools with 12 engineering workflows, 11 email categories and a 13-category phrase library.
- Added Meeting Phrasebook, Site Dictionary and 13 provider-controlled Quick AI actions.
- Added role-based daily tasks, mistake log, seven-day progress report and transparent assessment explanations.
- Added an honest Offline Pack capability map with fallback tests.
- Added deployment verification scripts, static RLS checks and expanded real-browser coverage.
- Added closed-beta adoption metrics, pricing research and a cancellable feedback workflow.
- Preserved existing learning, scoring, auth, billing, AI provider and backend contract architecture.

## v3.0.0 - Project Atlas Closed Beta Validation

- Added local-first closed beta onboarding for professional engineers with only essential calibration fields.
- Added structured closed beta feedback for bug reports, feature requests, general feedback, difficulty, mission, AI and UX ratings.
- Added anonymous local product analytics events and summary calculations for beta readiness evidence.
- Added beta readiness, success metrics, privacy review, analytics plan and limitations documentation.
- Preserved UI architecture, authentication, backend contracts, learning modules, assessment logic and scoring logic.

## v3.0.0 - Project Nova Prime Commercial UX Renaissance

- Transformed the authenticated shell into a light, premium commercial workspace while preserving routes, stores, services, providers and scoring logic.
- Reduced left navigation to 8 primary entries with a clearer active state and floating sidebar presentation.
- Replaced the overloaded Dashboard/Home experience with Today’s Mission, Continue Learning, Today’s Progress, AI Recommendation, Career Goal and a right-side Mission Control panel.
- Refined first-run login presentation for a calmer commercial first impression without changing authentication behavior.
- Preserved trust signals for Local Mode, Demo readiness, billing fallback and backend requirements.
- Quality gates passed: `npm ci`, typecheck, format check, lint, unit tests, build, Vitest E2E and Playwright browser E2E.

## v2.6.0 - Project Olympus Production Verification

- Added real Playwright Chromium browser E2E coverage for startup, auth, dashboard, learning routes, AI fallback, billing/profile state, resilience, responsive viewports, keyboard focus, refresh persistence and logout.
- Added production verification evidence documents and aligned metadata to v2.6.0.
- Fixed login route initialization so the local demo sign-in button becomes available outside `AuthGuard`.
- Stabilized AI usage summary selection to avoid browser runtime update loops under corrupted local storage resilience tests.
- Added vendor chunk splitting in Vite to reduce the main application bundle where practical.
- Kept release decision honest: deployment credentials required before public production launch.

## v2.5.6 - Project Titan Hardening

- Added Health backend contract for `GET /api/health`.
- Aligned billing portal contract to `POST /api/billing/create-customer-portal-session`.
- Added Stripe webhook proof helpers for signature-verified processing, idempotency keys, and supported event-state mapping.
- Added tests for Health response validation and Stripe webhook state mapping.
- Updated Supabase migration proof with required SaaS tables and RLS documentation.
- Added Titan hardening report and refreshed production readiness documentation.

## v2.5.5 - Project Helios Sprint D Release Candidate Gate

- Added release-candidate E2E smoke fallback suite with 20 scenarios.
- Added `npm run e2e`.
- Expanded `npm run quality:gate` to run format, lint, unit tests, E2E smoke tests, and build.
- Updated CI workflow to include format check, lint, unit tests, E2E smoke tests, and build.
- Added observability readiness contract and safe Profile health display.
- Added optional Sentry-compatible environment flags.
- Updated release, deployment, testing, limitation, and commercial readiness documentation.
- Preserved frontend architecture, routes, stores, providers, business logic, and UI direction.

## v2.5.4 - Project Helios Sprint C SaaS Backend Contracts

- Added backend contract types and validation helpers.
- Added AI and billing backend endpoint contracts.
- Added Supabase production foundation migration with RLS.
- Added security and deployment documentation.
- Added safer environment validation.

## v2.5.3 - Project Helios Sprint B Content Expansion

- Expanded professional engineering writing missions.
- Expanded vocabulary content pack.
- Hardened assessment confidence and internal CEFR/ELO mapping.
