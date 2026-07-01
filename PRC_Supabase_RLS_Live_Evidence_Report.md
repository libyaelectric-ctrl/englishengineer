# PRC Supabase RLS Live Evidence Report

## Verdict

**BLOCKED_BY_OPERATOR_ACTION**

Static migration and policy checks are available locally. No Supabase staging
project was linked from this workstation, so live multi-user isolation is not
claimed.

`npm run verify:rls` passed on 2026-07-01. This proves the expected migration
statements, ownership checks, Stripe service-role boundary, team helpers and
summary privacy policy exist in source. It does not replace a live staging
isolation test.

## Required Live Evidence

| Check                                            | Status  |
| ------------------------------------------------ | ------- |
| Staging migrations applied                       | BLOCKED |
| Static RLS source verification                   | PASS    |
| Learner A reads own writing attempts             | NOT RUN |
| Learner B reads own writing attempts             | NOT RUN |
| Learner A cannot read learner B raw attempts     | NOT RUN |
| Learner B cannot read learner A raw attempts     | NOT RUN |
| Manager reads allowed summaries                  | NOT RUN |
| Manager cannot read raw writing or speaking text | NOT RUN |
| Subscription checks avoid private-data leakage   | NOT RUN |

## Safe Test Method

1. Use synthetic learner A, learner B and manager accounts in staging.
2. Insert synthetic attempts through each learner session.
3. Query each table with each learner token and record row counts only.
4. Query manager summary views and confirm raw answer fields are absent.
5. Run `npm run verify:rls` after migrations are applied.
6. Record timestamp, project environment and PASS/FAIL only. Never include raw
   learner text, tokens, keys or service-role values.

## Current Evidence Boundary

- Live project reference: **NOT RECORDED**
- Live test timestamp: **NOT RUN**
- User isolation: **NOT VERIFIED LIVE**
- Manager summary-only access: **NOT VERIFIED LIVE**
