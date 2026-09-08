# Test Coverage Status

> Updated for the Firebase authentication architecture on 7 September 2026.

## Current gates

- Frontend unit and integration suites run with Vitest.
- Backend route and repository suites run with the backend test command.
- Public Playwright smoke tests do not require credentials.
- Authenticated Playwright suites use a dedicated Firebase test project through
  `tests/helpers/firebase-login.ts`.
- CI enforces the generated coverage summary; missing reports are treated as a
  configuration failure during the Phase 8 final gate.

## Required CI secrets for authenticated E2E

- `VITE_FIREBASE_API_KEY`
- `FIREBASE_E2E_TEST_EMAIL`
- `FIREBASE_E2E_TEST_PASSWORD`

The E2E password belongs only to the isolated test project. Production user
credentials must never be used in CI.

## Verification status

The local ZIP environment cannot install the complete dependency graph because
external package-network access is unavailable. Phase 8 therefore records
static syntax/contract checks locally and requires a fresh GitHub Actions run
for authoritative typecheck, lint, coverage, build and browser results before
final closure.
