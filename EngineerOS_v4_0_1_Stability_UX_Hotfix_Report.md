# EngineerOS v4.0.1 Stability and UX Hotfix Report

## Scope

This hotfix is limited to test reliability, Speaking light-theme consistency, primary-button color softness, dashboard rail alignment and the specified Turkish Work Tools corrections. No architecture, scoring, evaluator, provider, route or content-count expansion was introduced.

## Stability fixes

- The default `npm run test` command now runs Vitest with the existing runner config, one worker and dot reporting.
- `npm run quality:gate` continues to execute clean install, typecheck, format, lint, the stable default test command, build, application E2E, backend install and backend tests.
- No tests were removed or skipped.

## Speaking UI fixes

- Mission prompt, transcript capture, recognized transcript, typed fallback, completion state, target terms and latest score metrics now use white, slate-50 or sky-50 surfaces.
- Dark translucent slate panels and `border-engineer-800` were removed from Speaking content panels.
- White text remains only where required for contrast on colored action buttons.
- Speaking evaluation, recording support and typed fallback behavior remain unchanged.

## Color and layout polish

- Primary buttons now use `sky-600` with a restrained `sky-700` hover.
- Beta onboarding, feedback and sidebar branding follow the same softer blue level.
- The application shell uses clearer slate-300 left/right separators.
- Dashboard center and sticky right rail retain responsive behavior with improved spacing, border alignment and viewport positioning.

## Turkish content cleanup

The requested forms were corrected in Work Tools and Quick Tools content, including `altına`, `netleştirir`, `kapanış`, `kanıt`, `değeri`, `tamamlandığını`, `perşembe gününe`, `karşılandığını`, `doğrulama yöntemini` and `ayrı biçimde`.

## Content count lock

| Content area          | Count |
| --------------------- | ----: |
| Engineering Templates |    62 |
| Email Templates       |    51 |
| Phrase Library        |   113 |
| Meeting Phrasebook    |    91 |
| Site Dictionary       |   323 |
| Quick AI Actions      |    13 |

The existing exact-count and integrity tests remain active.

## Quality gate

| Command                   | Result                                                   |
| ------------------------- | -------------------------------------------------------- |
| `npm ci`                  | PASS - 308 packages, 0 vulnerabilities                   |
| `npm run typecheck`       | PASS                                                     |
| `npm run format:check`    | PASS                                                     |
| `npm run lint`            | PASS                                                     |
| `npm run test`            | PASS - 24 files, 130 tests, stable single-worker command |
| `npm run build`           | PASS - 2,302 modules transformed                         |
| `npm run e2e`             | PASS - 20 tests                                          |
| `npm run backend:install` | PASS - 70 packages, 0 vulnerabilities                    |
| `npm run backend:test`    | PASS - 10 tests                                          |
| `npm run verify:release`  | PASS - structure, version, WAV assets and content totals |
| `npm run verify:rls`      | PASS - static RLS/policy/ownership checks                |
| `npm run e2e:browser`     | PASS - 9 real Chromium tests                             |

The default `npm run test` also passed independently before the complete gate. The complete `npm run quality:gate` passed with the stable test command.

## Build and browser evidence

- Production entry chunk: 259.20 kB raw / 81.26 kB gzip.
- CSS: 84.50 kB raw / 13.88 kB gzip.
- Real Chromium covered startup, authentication, core routes, unavailable services, offline/corrupted storage, responsive layouts, keyboard focus and the light Speaking result state.
- No test was removed, skipped or weakened.

## Product status

Target status: **95/100 closed-beta / controlled paid-beta candidate**.

This report does not claim public SaaS readiness. Live AI, Stripe and Supabase evidence still requires configured deployment credentials and external-service verification.

Deployment credentials required.
