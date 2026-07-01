# PRC Kademe 5 Cloud Sync Report

## Kademe

PRC Kademe 5 — Cloud Sync Foundation

## Local State Owners

Cloud sync consumes existing owners rather than duplicating business state:

- Learning Engine: `learning_state`
- Reading/Writing/Listening/Speaking services: their existing history stores
- Vocabulary: state, memory and menu stores grouped as one review domain
- Grammar: existing grammar progress store
- Learning Intelligence: mistake log
- Task Evaluation Service: review/task records
- Learning Profile Repository: per-user independent skill state
- AI Coach and Gamification: existing feature stores
- Auth adapter: user preferences/profile snapshot

## What Changed

- Expanded the versioned snapshot to all required learning domains.
- Added cloud-to-local restore after conservative merge.
- Added debounced sync scheduling when canonical local owners change.
- Preserved local/demo mode without creating cloud queue activity.
- Preserved offline queueing and five-attempt retry limit.
- Added Profile sync status for local, synced, syncing, offline and failed
  states.
- Reused the existing `user_progress_snapshots` table and RLS policy.

## Files Changed

- `src/features/auth/cloud-sync.types.ts`
- `src/features/auth/cloud-sync.service.ts`
- `src/features/auth/cloud-sync.service.test.ts`
- `src/features/auth/CloudSyncStatus.tsx`
- `src/features/auth/index.ts`
- `src/providers/AppProvider.tsx`
- `src/shared/storage/index.ts`
- `src/pages/ProfilePage.tsx`
- `SUPABASE.md`
- `PRC_Kademe_5_Cloud_Sync_Report.md`

## Merge And Offline Policy

- Numbers use maximum value.
- Arrays de-duplicate remote then local values.
- Objects merge recursively.
- String conflicts prefer local values.
- Local progress remains available during offline or failed sync states.
- Successful merges are restored to the canonical local stores.
- Field-level timestamps remain future hardening work.

## RLS And Migration Decision

No new migration is required. The existing JSONB
`user_progress_snapshots.snapshot` column supports the expanded versioned
payload, and its RLS policy enforces `auth.uid() = user_id`. Static verification
is automated; live two-user proof remains a staging task.

## Commands And Results

| Command                | Exit code | Result                                 |
| ---------------------- | --------- | -------------------------------------- |
| `npm run typecheck`    | 0         | TypeScript check passed                |
| `npm test`             | 0         | 50 files and 210 tests passed          |
| `npm run build`        | 0         | Build passed; main chunk 400.09 kB     |
| `npm run verify:rls`   | 0         | Static ownership and RLS checks passed |
| `npm run backend:test` | 0         | 38 tests passed                        |
| `npm run quality:gate` | 0         | Full release chain passed naturally    |

The quality gate also passed 20 application E2E scenarios. No test was skipped
or removed.

## Failures

No unresolved Kademe 5 failure remains. The new UI test initially inherited a
node-only test environment; it was moved into the existing jsdom cloud-sync
suite. Duplicate jsdom startup was removed to keep the mandatory test process
inside its natural quality-gate lifecycle budget.

## Remaining Blockers

- Live Supabase save/load and two-user isolation require staging credentials.
- Conflict resolution remains conservative rather than field-timestamp based.

## Score Estimate

- SaaS candidate: 91 before, 93 after.
- Closed beta readiness: 91–92 before, 93–94 after.
- Public production readiness: 78 before, 81 after.

No live cloud deployment is claimed by this source-level result.

## Next Kademe Decision

Kademe 5 is complete. Automatic progression to PRC Kademe 6 is allowed by the
user's operating instruction.
