# EngineerOS 4.8 Recommendations Execution Report

## Decision Rule

Changes were made only where the existing architecture supported them safely.
External accounts, legal expertise, real users, real devices or high-risk data
restructuring were not simulated.

## Recommendation Results

|   # | Recommendation                     | Status  | Result                                                                                     |
| --: | ---------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
|   1 | Railway backend                    | BLOCKED | Railway staging service and URL require operator deployment                                |
|   2 | Stripe TEST lifecycle              | BLOCKED | Requires Railway URL, Stripe dashboard and test webhook evidence                           |
|   3 | Vercel frontend                    | BLOCKED | Account is available but deployment correctly waits for Railway                            |
|   4 | Supabase migrations and live RLS   | BLOCKED | Static RLS passes; live project and three-account proof are pending                        |
|   5 | AI proxy and Upstash               | BLOCKED | Backend-only live request and shared 429 proof require Railway                             |
|   6 | One main and one review task       | DONE    | Home and Learning Hub already expose one primary lesson and due-review path                |
|   7 | Explain review reasons             | DONE    | Vocabulary and Grammar now show evidence-based “why now” explanations                      |
|   8 | Weekly recovery plan               | PARTIAL | Existing weak-skill priority and Learning Plan are reused; no duplicate scheduler added    |
|   9 | CEFR transition test               | SKIPPED | A new high-stakes evaluator needs a separate assessment/content sprint                     |
|  10 | Human pedagogy audit               | PARTIAL | Automated content validation passes; expert human review cannot be fabricated              |
|  11 | Pricing comparison and limits      | DONE    | Audience, inclusions, exclusions, current Free limits and pending paid limits are explicit |
|  12 | Publish support and sales contacts | BLOCKED | Real verified contact addresses were not supplied                                          |
|  13 | Export and account deletion        | PARTIAL | Local JSON export and confirmed local clearing added; cloud deletion remains blocked       |
|  14 | Legal review                       | BLOCKED | Requires a qualified legal reviewer                                                        |
|  15 | Closed beta with 20–50 engineers   | BLOCKED | Requires real users and measured sessions                                                  |
|  16 | Raise branch coverage to 60%       | PARTIAL | Focused tests added; a broad coverage sprint was not mixed into this stabilization pass    |
|  17 | Split large B1/B2 data chunks      | SKIPPED | Current CEFR lazy loading is safe; deeper splitting risks ordering and import contracts    |
|  18 | Error/performance monitoring       | PARTIAL | Optional observability contract exists; real provider and DSN remain external              |
|  19 | Backup and restore drill           | BLOCKED | Requires deployed Supabase staging and backup access                                       |
|  20 | Real Android/iPhone testing        | PARTIAL | Chromium phone/tablet viewports pass; physical devices were unavailable                    |

## Additional Trust Fix

Placeholder public URLs are now rejected by the common environment validator.
Billing displays **Backend configured**, not **Backend verified**, when only an
endpoint is present. Real verification still requires Kademe 8 evidence.

## Final Quality Evidence

- Frontend unit tests: **237 passed across 59 files**.
- Coverage run: **257 passed across 60 files**.
- Vitest release flow: **20 passed**.
- Backend tests: **38 passed**.
- Chromium browser tests: **11 passed**.
- Typecheck, formatting, lint, content validation, build, release structure and
  static RLS verification: **PASS**.
- Branch coverage: **40.09%**.
- Main application JavaScript: **420.45 kB minified / 128.60 kB gzip**.

## Files Added

- `src/shared/storage/storage.test.ts`
- `EngineerOS_4_8_Recommendations_Execution_Report.md`

## Main Files Updated

- `src/config/environment.config.ts`
- `src/features/ai/ai.config.ts`
- `src/features/billing/billing.catalog.ts`
- `src/features/billing/billing.helpers.ts`
- `src/features/billing/BillingStatusPanel.tsx`
- `src/features/grammar/grammar.progress.ts`
- `src/features/vocabulary/vocabulary.menu.ts`
- `src/pages/GrammarPage.tsx`
- `src/pages/PricingPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/VocabularyPage.tsx`
- `src/shared/storage/index.ts`
- related focused tests and documentation

## Remaining External Sequence

1. Railway staging backend and health proof
2. Stripe TEST lifecycle
3. Vercel frontend
4. Supabase staging migrations and live RLS
5. AI proxy and Upstash proof
6. Legal contacts, beta users, physical-device testing and backup drill

No blocked item is reported as complete.
