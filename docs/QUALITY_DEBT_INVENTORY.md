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

## Dead code — measured, not yet enforced (2026-09-19)

`knip.json` checks `files,dependencies` only, so "no dead code" has so far meant
"no unreachable file and no unused dependency". The wider check is a different
number, and worth recording before someone quotes the narrow one:

```bash
npx knip --include files,exports,types,duplicates
```

- **153 unused exports.** The large majority are barrel re-exports (`src/**/index.ts`)
  and constants that only tests or newer code paths consume, so the count is a
  measurement of surface area, not of 153 deletions. Clearing it is a lint-rule
  change plus a reviewed sweep, and it should not be done as a drive-by cleanup:
  a barrel export is what an unmigrated consumer imports.
- Turning `exports` on in `knip.json` without that sweep would make the check red on
  day one, which is how a useful gate gets ignored (see TD-023's "check that cries
  wolf" note in `scripts/check-freebuff-refs.mjs`).

Next step, when it is scheduled: add `exports` to `include`, delete in batches of
one feature, and let each batch's own tests be the proof.
