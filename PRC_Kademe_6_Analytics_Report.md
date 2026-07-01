# PRC Kademe 6 Analytics Report

## Kademe

PRC Kademe 6 — Analytics Funnel and Privacy Guard

## What Changed

- Added one typed catalog for all required product funnel events.
- Added local, console, disabled and pluggable custom provider modes.
- Kept existing local beta summaries on their canonical storage key.
- Added a runtime metadata allowlist and strict mission identifier validation.
- Connected signup, onboarding, first task, Vocabulary review, Grammar task,
  Speaking roleplay, Writing task, review queue, paywall and checkout events.
- Added cancellation-at-period-end detection without claiming a portal cancel
  event that the frontend cannot observe.
- Added environment controls that can disable analytics completely.

## Files Changed

- `src/features/analytics/product-analytics.types.ts`
- `src/features/analytics/product-analytics.provider.ts`
- `src/features/analytics/product-analytics.service.ts`
- `src/features/analytics/product-analytics.service.test.ts`
- `src/features/analytics/index.ts`
- `src/features/beta/beta.types.ts`
- `src/features/beta/beta.service.ts`
- `src/features/beta/beta.store.ts`
- `src/features/beta/beta.helpers.test.ts`
- `src/features/beta/BetaOnboarding.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/VocabularyPage.tsx`
- `src/pages/GrammarPage.tsx`
- `src/pages/SpeakingPage.tsx`
- `src/pages/WritingPage.tsx`
- `src/pages/CurriculumPage.tsx`
- `src/pages/ProfilePage.tsx`
- `.env.example`
- `ANALYTICS.md`
- `PRC_Kademe_6_Analytics_Report.md`

## Privacy Policy

- No raw writing answer is accepted.
- No raw speaking transcript is accepted.
- No name, email, token or arbitrary personal field is accepted.
- Metadata is reconstructed from an explicit allowlist.
- Analytics can be disabled by environment configuration.
- Local mode stores at most 500 sanitized events.

## Provider Expansion

A production provider implements `ProductAnalyticsProvider.track(event)` and is
registered with `ProductAnalyticsService.setProvider()`. Pages remain unaware of
the vendor. No production analytics vendor is configured or claimed in this
source package.

## Commands And Results

| Command                | Exit code | Result                              |
| ---------------------- | --------- | ----------------------------------- |
| `npm run typecheck`    | 0         | TypeScript check passed             |
| `npm test`             | 0         | 51 files and 213 tests passed       |
| `npm run build`        | 0         | Build passed; main chunk 402.13 kB  |
| `npm run quality:gate` | 0         | Full release chain passed naturally |

The quality gate also passed 20 application E2E scenarios and 38 backend
tests. No test was skipped or deleted.

## Failures

One test-provider callback initially returned the numeric result of
`Array.push`; TypeScript correctly rejected it. The callback was changed to an
explicit void body. A barrel import that temporarily increased the main bundle
to 429.08 kB was replaced with direct product-analytics imports, returning the
main bundle to 402.13 kB.

## Remaining Blockers

- Production provider selection and data-processing agreements require a
  deployment decision.
- `subscription_cancel_clicked` is typed but cannot be truthfully emitted for a
  Stripe-hosted portal click that the frontend does not observe.
- Funnel conversion and retention evidence require real beta users.

## Score Estimate

- SaaS candidate: 93 before, 93–94 after.
- Closed beta readiness: 93–94 before, 94 after.
- Public production readiness: 81 before, 82 after.

No real-user funnel evidence is claimed.

## Next Kademe Decision

Kademe 6 is complete. Automatic progression to PRC Kademe 7 is allowed by the
user's operating instruction.
