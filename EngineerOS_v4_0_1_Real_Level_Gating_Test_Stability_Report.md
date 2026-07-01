# EngineerOS v4.0.1 Real Level Gating and Test Stability Report

## Scope

This hardening patch addresses default test reliability and real per-skill CEFR content gating. It also fixes the reported metric overflow and reduces the Profile page to a compact name and subscription view. Backend contracts, scoring, providers, Work Tools content and existing assets were preserved.

## Test stability

The audit timeout was caused by two compounding issues:

1. The default unit command also discovered `src/e2e`, duplicating the separately executed 20-scenario application E2E suite.
2. Every discovered file was forced through one worker, making jsdom setup sequential and pushing the command beyond the audit window.

The default command now uses two controlled workers and excludes only `src/e2e/**` from unit discovery. No test was removed: application E2E remains in `npm run e2e`, browser E2E remains in `npm run e2e:browser`, and backend tests remain unchanged.

## Real skill-based gating

A shared level-gating layer now provides:

- `My Level` as the default mode.
- `Review Previous`, `Preview Next`, and intentional `All Levels` modes.
- `Current`, `Review`, `Preview`, and `Locked` access labels.
- Independent Reading, Writing, Listening, Speaking and Vocabulary levels.
- A strict separation between career topic selection and CEFR difficulty.

Reading, Writing, Listening, Speaking and Vocabulary pages all consume the current level for their own skill. A Reading level can therefore be B2 while Speaking remains A1.

## Beginner starter content

Minimum A1 and A2 starter content was added only where it was missing:

- Two Reading missions.
- Two Writing missions.
- Two Listening missions with matching local WAV audio.
- Two Speaking missions.
- A compact A1/A2 engineering Vocabulary starter set.

Existing advanced content remains available through the explicit filters. Demo stores now default to A1 mission IDs, and Vocabulary initializes with an A1 queue.

## Test evidence

Tests prove that:

- Every demo skill starts at A1.
- Reading can be B2 while Speaking is A1.
- A1 normal view excludes C2.
- `My Level` is the shared default.
- `All Levels` is an intentional selection.
- Vocabulary supports A1 and A2.
- Every skill dataset has A1 and A2 content.
- Page-level browser flows display the correct A1 content and filters.

## UX fixes

- Dashboard Score, ELO and Done cards stack when the available width is too narrow and use a stable 300 px group on large layouts.
- Shared MetricCard values wrap safely instead of escaping their containers.
- Shared buttons allow controlled wrapping and keep text inside their bounds.
- Profile is now a compact two-column page with only first name and last name as editable personal details.
- Subscription controls remain available without exposing unnecessary profile fields.

## Content and assets

- Work Tools counts were not changed.
- Existing ten Listening WAV files were preserved.
- Two matching beginner WAV files were added; the release now contains twelve WAV assets.
- No asset or test was deleted.

## Quality gate

| Command                   | Result                                                |
| ------------------------- | ----------------------------------------------------- |
| `npm ci`                  | PASS - 308 packages, 0 vulnerabilities                |
| `npm run typecheck`       | PASS                                                  |
| `npm run format:check`    | PASS                                                  |
| `npm run lint`            | PASS                                                  |
| `npm run test`            | PASS - 27 files, 131 tests, approximately 22 seconds  |
| `npm run build`           | PASS - 2,308 modules transformed                      |
| `npm run e2e`             | PASS - 20 tests                                       |
| `npm run backend:install` | PASS - 70 packages, 0 vulnerabilities                 |
| `npm run backend:test`    | PASS - 13 tests                                       |
| `npm run verify:release`  | PASS - version, content, migrations and 12 WAV assets |
| `npm run verify:rls`      | PASS - static RLS, policy and ownership checks        |
| `npm run e2e:browser`     | PASS - 9 real Chromium tests                          |

`npm run quality:gate` completed successfully with the expanded Vocabulary tests. The production entry chunk is 259.42 kB raw / 81.32 kB gzip.

The first enhanced browser run exposed only an ambiguous test selector because the correct A1 title appeared in both a mission button and heading. The selector was narrowed without changing product behavior. A later sandboxed retry could not read the Vite config, while the approved runtime completed the same suite successfully. The authoritative final browser result is 9/9 passed.

## Product status

Target: **95/100 closed-beta / controlled paid-beta candidate**.

This patch does not claim public SaaS readiness. Live AI, Stripe, Supabase and deployment evidence still require configured external services and credentials.

Deployment credentials required.
