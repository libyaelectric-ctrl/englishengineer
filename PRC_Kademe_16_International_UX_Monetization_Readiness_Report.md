# PRC Kademe 16 International UX and Monetization Readiness Report

**Owner / author:** Özcan ERENSAYIN  
**Source contract:** EngineerOS v4.0.1  
**Working folder:** `4.8`

## Verdict

**CODE-READY WITH LIVE-SERVICE BLOCKERS**

- Kademe 8: **BLOCKED**
- Production launch: **NO**
- Live billing: **NO**
- Public SaaS claim: **NO**

## Kademe 8 Status

Local environment files exist and required configuration is reported only as
`OK`, `MISSING` or `PLACEHOLDER`. The local backend health contract recognizes
AI, Stripe and Supabase configuration. Railway is not authenticated in this
operator environment, no Railway backend URL exists, and frontend backend URLs
remain placeholders. No deployment or live-service completion is claimed.

## Files Changed

- Localization: `src/features/localization/*`
- Profile/onboarding: profile types, preferences, repository, defaults and
  `OnboardingPage.tsx`
- Learning UX: `GrammarPage.tsx`, `VocabularyPage.tsx` and related tests
- Feedback: beta feedback types and widget
- Monetization preview: billing catalog, pricing page and billing exports
- Global positioning: `LandingPage.tsx`
- Documentation and verification: `README.md`, `ENVIRONMENT.md`,
  `DEPLOYMENT_GUIDE.md`, Kademe 8 verifier and reports

## Language and International UX

- English remains the default product language.
- English and Turkish are available through one local translation-key system.
- Arabic, Spanish, Italian and French are represented as planned language
  packs without page duplication.
- Missing fixed-copy translations fall back to English.
- Learning content remains English; selected-language support is applied to
  reviewed helper and explanation labels.
- Global positioning now describes AI-powered communication training for
  engineers on international projects without fake testimonials or identities.

## Onboarding Profession Flow

- Electrical Engineering remains the only active professional track.
- The next selector contains only electrical subdomains: LV, MV, lighting,
  ELV, fire alarm, generators, UPS, data centers, hospitals, commissioning,
  electrical QA/QC, testing/inspection and site coordination.
- The experience menu was removed from active onboarding.
- Work focus changes topic context only; independent CEFR skill difficulty is
  unchanged.

## Grammar Rule-First UX

Each selected rule now presents the rule title, meaning/function, form,
English explanation, optional Turkish support, engineering examples,
wrong/correct comparison, mini practice and connected Reading/Writing actions.
Grammar progress and scoring behavior were not replaced.

## Vocabulary UX and Behavior

- Search is positioned before active learning and never auto-saves a result.
- Canonical search results require an explicit `Save to Learned` action.
- New words can move to Learned with one action.
- Visible `0/3 correct` counters and mastery requirement copy were removed.
- Learned and Mastered collections are passive; recall controls appear only in
  the Due section.
- The ten-word set, 8-new/2-review recommendation and existing SRS engine are
  preserved.
- Progress, weak/forgotten and supporting statistics are lower on the page.

## Feedback

- The widget remains active and has a smaller mobile-safe trigger.
- Types are Bug, Content issue, UX problem, Suggestion and Other.
- The form accepts message and optional page/context.
- Fake screenshot upload was removed. Real upload remains future Supabase
  Storage work.

## Pricing and Monetization

- Added a typed commercial preview for Free, Starter `$5`, Core `$10`, Pro
  `$19` and Team `$99`.
- Only Free local access is marked available. Paid plans are explicit previews
  while Stripe staging is unverified.
- Paid plans are ad-free.
- Free sponsor readiness is disabled by default and forbids active-task,
  primary-action, mobile-nav and blocking-popup placements.
- Existing backend-trusted entitlements remain the source of truth; no payment
  verification moved into UI code.

## Tools Section Review

- **Work Tools:** engineering templates, email templates, phrase libraries,
  meeting language and site terminology.
- **Quick Tools:** fast communication utilities and provider-controlled
  rewriting actions.
- **AI Copilot:** provider-backed engineering communication workflows with
  explicit mock/backend trust states.
- Future work should improve per-tool status/help and remove any inactive
  control only after usage evidence. No heavy Tools redesign was made.

## Commands and Evidence

| Command                           | Exit | Result                                                  |
| --------------------------------- | ---: | ------------------------------------------------------- |
| `npm ci`                          |    0 | PASS; 326 packages, 0 vulnerabilities                   |
| `npm run content:validate`        |    0 | PASS; 30 Listening, 30 roleplay, 30 Writing definitions |
| `npm run typecheck`               |    0 | PASS                                                    |
| `npm run format:check`            |    0 | PASS                                                    |
| `npm run lint`                    |    0 | PASS                                                    |
| `npm test`                        |    0 | PASS; 56 files, 227 tests                               |
| `npm run build`                   |    0 | PASS; 2,000 modules transformed                         |
| `npm run e2e`                     |    0 | PASS; 20 smoke scenarios                                |
| `npm run backend:install`         |    0 | PASS; 0 vulnerabilities                                 |
| `npm run backend:test`            |    0 | PASS; 38 tests                                          |
| `npm run verify:release`          |    0 | PASS; required content counts preserved                 |
| `npm run verify:rls`              |    0 | PASS static migration checks                            |
| `npm run quality:gate`            |    0 | PASS; 126.5 seconds                                     |
| `npm run e2e:browser`             |    0 | PASS; 11 Chromium scenarios                             |
| `npm run quality:gate:browser`    |    0 | PASS; 193.2 seconds                                     |
| `npm run kademe8:check`           |    0 | BLOCKED preflight; no live request                      |
| `npm run kademe8:verify`          |    1 | BLOCKED; internal verifier exit 2                       |
| local backend public health check |    0 | AI, Stripe and Supabase configured; no secret output    |

The first post-env integration pass exposed three smoke assertions that assumed
backend configuration was absent. The tests were retained and made explicit:
Mock AI is tested through `MockAIProvider`, while configured billing/provider
states accept only their honest visible status. The first browser pass exposed
the same stale copy assumptions; final browser and combined gates pass.

## Build Summary

- Main application chunk: **416.35 kB** minified / **127.60 kB** gzip.
- CSS: **93.44 kB** minified / **15.25 kB** gzip.
- Large CEFR data chunks remain code-split but exceed the 500 kB warning
  threshold. This is documented technical debt, not hidden.

## Known Limitations and Blockers

1. Railway backend URL and authenticated Railway operator session are missing.
2. Stripe webhook delivery and checkout/customer portal flow are not verified.
3. Vercel frontend is not deployed because backend URLs are not available.
4. Supabase migrations and live 2-user + manager RLS evidence are not verified.
5. Full-page Turkish translation and future language packs are incomplete.
6. Real screenshot upload and sponsor/ad provider integration are intentionally
   not implemented.
7. Prices require legal/business approval before commercial use.

## Release Decision

- Production launch: **NO**
- Live billing: **NO**
- Legal review required: **YES**
