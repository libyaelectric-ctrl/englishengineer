# Quality debt inventory

Updated: 8 September 2026

## Enforced baseline

The repository-wide quality-debt audit scans `src`, `backend/src`, and `scripts`.
It fails when an `@ts-ignore` is introduced, when total suppression sites rise
above 22, or when complexity suppressions rise above 9.

Run:

```bash
node scripts/audit-quality-debt.mjs
```

## Current disposition

- `@ts-ignore`: zero allowed.
- `@ts-expect-error`: must remain explicit and reviewable.
- Complexity suppressions: temporary ceiling of 9; new sites are blocked.
- Hook performance: `.husky/pre-commit` prints elapsed seconds, uses incremental
  TypeScript state, and runs only tests related to staged TypeScript files.
- Vitest memory: the checked-in configuration uses one worker and a 2 GB process
  ceiling in the quality gate. Authoritative peak memory still requires a fresh CI run.

The numerical ceiling is a regression guard, not a claim that the remaining
suppressions are resolved. High-impact render functions remain scheduled for
component extraction during the visual phase, where screenshot and browser gates
can be applied without bypassing the required UI workflow.
