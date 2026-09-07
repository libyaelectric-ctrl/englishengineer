# EngineerOS Learning Refactoring Plan

Status: approved architecture baseline for incremental implementation

## Problem

`src/core/learning/learning.store.ts` combines mission lifecycle, progress and history, gamification, content pools, profile writes, authentication lookup, event publication and persistence migration. This makes isolated testing difficult and creates a forbidden dependency direction from `core` to `features/auth` and `features/profile`.

## Target boundaries

| Boundary | Owns | Must not import |
| --- | --- | --- |
| Mission | mission catalogue, start/complete transitions | auth, profile UI, gamification store |
| Progress | study sessions, score/XP/ELO history, streak | auth feature, components/pages |
| Gamification | XP, level, coins, hearts, achievements | profile feature, content pools |
| ContentPool | vocabulary/grammar/speaking pools, weak terms | auth, profile, mission UI |
| Orchestrator | coordinates one practice completion transaction | React pages/components |

Domain modules publish typed commands/events. They do not reach into feature stores. User identity and profile persistence are injected through ports owned by `core`:

```ts
interface CurrentUserPort { getUserId(): string | null }
interface LearningProfilePort { recordPractice(input: PracticeProfileUpdate): void }
interface LearningEventPort { publish(event: LearningDomainEvent): void }
```

Feature adapters implement these ports outside `core`.

## Persistence compatibility

The public storage key remains `learning_state` until all consumers migrate. A versioned persisted envelope is required:

```ts
interface PersistedLearningStateV2 {
  version: 2;
  mission: MissionState;
  progress: ProgressState;
  gamification: GamificationState;
  contentPool: ContentPoolState;
}
```

Migration must be pure and idempotent: `migrateV1ToV2(v1)` must preserve missions, achievements, XP, level, coins, ELO, streak, histories, hearts and all pools. Unknown fields are ignored; malformed arrays become empty arrays. The legacy key is removed only after a successful persisted V2 write.

## Incremental sequence

1. **Characterization** — freeze current mission completion, generic practice, hearts, pools, reset and hydration behavior with tests.
2. **Pure reducers** — extract mission, progress, gamification and content-pool reducers without changing `useLearningStore`.
3. **Dependency inversion** — replace direct auth/profile imports with `CurrentUserPort` and `LearningProfilePort` adapters.
4. **Versioned persistence** — add V1→V2 migration and round-trip tests.
5. **Focused stores** — create four stores using the reducers. Keep a compatibility facade exposing the current `LearningStoreActions` API.
6. **Consumer migration** — move imports by feature, one commit group at a time. No page may import another feature's store through `core`.
7. **Facade removal** — remove the old God Store only when code search finds no direct consumers and reload/account-switch E2E is green.

## Commit and rollback rules

- Each boundary extraction is an independent commit.
- No storage-key change may be combined with UI behavior changes.
- Every persistence commit includes V1 fixture, V2 fixture, forward migration and reload tests.
- Rollback reverts application commits but does not delete user data. Destructive storage cleanup requires a separately reviewed migration.

## Architecture budgets

Budgets can only decrease. The baseline must be measured by CI before changing a threshold. New violations are forbidden even if the repository remains below the historical ceiling.

- `core -> features`: target 0; no new violation allowed immediately.
- `shared -> features`: target 0; ratchet from measured baseline.
- feature-to-feature imports: ratchet from measured baseline by migrated domain.
- `as unknown as` at route-registration boundaries: target 0.

CI should store the measured baseline and compare changed code against it. A threshold increase requires an ADR and explicit risk acceptance.

## API and error contracts

Backend success responses migrate incrementally to versioned `ApiResponse<T>`; error responses keep `ApiErrorResponse`. A route and its frontend consumer move in the same commit group. Global response rewriting is prohibited.

Error boundaries keep global, route and page scopes. Only fallback rendering, correlation IDs and reporting policy are shared; scope-specific recovery actions remain local.

## Exit criteria

- `core` has no runtime import from `features`.
- Mission, Progress, Gamification and ContentPool are independently tested.
- V1 state migrates to V2 without data loss and supports reload/account-switch.
- `learning.store.ts` is a compatibility facade or removed.
- Architecture budgets reject every new violation.
- Route registration compiles without `as unknown as Express`.
