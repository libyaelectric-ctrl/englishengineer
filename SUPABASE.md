# Supabase Auth & Cloud Sync

## v4.0.1 durable billing repository

The backend can persist `subscription_status` and Stripe idempotency records through Supabase REST using the service-role key. Configure `BILLING_REPOSITORY=supabase`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` only in the backend environment. Migration `202606270001_stripe_processed_events.sql` creates the backend-only event table, enables RLS, removes browser-role privileges, and grants access to `service_role`.

The frontend never receives the service-role key. Live migration, user isolation, and Stripe webhook proof still require a configured staging project.

## RLS verification

`npm run verify:rls` validates migration text only. Live proof must be performed against a configured test project with two separate authenticated users:

1. Apply migrations with the Supabase CLI.
2. Insert one owned row as User A and one as User B.
3. Query User B's identifier using User A's access token and confirm zero rows.
4. Repeat for every private table and confirm the anonymous key cannot read private rows.

Service-role credentials belong on the backend only. No live RLS proof is claimed by the source package.

Current source version: **v4.0.1**. Migrations and adapters are included; live
RLS isolation is not claimed without a configured Supabase project.

Static RLS migration checks pass, but live two-user isolation proof requires a configured Supabase project.

## v2.6.0 Verification Note

Project Olympus does not add live Supabase credentials. Browser and unit coverage verify that local mode remains usable, missing backend credentials are handled safely, and deployment still requires real Supabase project configuration before production launch.

## Purpose

EngineerOS remains local-first by default. Supabase is the production authentication and cloud synchronization adapter when the following environment configuration is present:

```env
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If the provider is not set to `supabase`, or if URL / anon key values are missing, EngineerOS safely falls back to the local auth adapter. Demo login remains available only in local mode.

## Architecture

Supabase integration follows the existing EngineerOS adapter pattern:

- `AuthService` selects the active provider from environment configuration.
- `LocalAuthAdapter` remains the default development and offline demo provider.
- `SupabaseAuthAdapter` handles production email/password authentication.
- `supabase.client.ts` is the only place that creates the Supabase browser client.
- `cloud-sync.service.ts` is the only data layer that writes learning progress snapshots to Supabase.

Application pages, routes, Learning Engine, AI Coach, Analytics, Gamification and Vocabulary continue to use their existing stores and services.

## Authentication Flow

1. The app starts and the auth store calls `AuthService.restoreSession()`.
2. In Supabase mode, the Supabase client restores the persisted session.
3. The adapter loads the authenticated user and then attempts to load the profile row.
4. If the profile table is unavailable or the row does not exist yet, EngineerOS uses safe auth metadata as a fallback profile.
5. Sign in and sign up use Supabase email/password auth.
6. Password reset is prepared through `AuthService.resetPassword(email)`.
7. Email verification is supported by Supabase sign-up redirect handling.

Normal `AuthService.getCurrentUser()` calls are read-only and do not trigger
cloud writes. Sync runs after login, sign-up, session restore, profile update,
online-return events and debounced changes to canonical learning stores.

## Cloud Synchronization

Cloud sync does not duplicate XP, ELO, achievements, streaks, vocabulary progress or AI Coach sessions. It reads the canonical local stores and uploads a versioned progress snapshot.

Synced domains:

- Learning state, XP, ELO, streak and achievements
- Reading, writing, listening and speaking histories
- Vocabulary memory, menu progress and review state
- Grammar review state
- Mistake log and task evaluation/review records
- Per-user learning profile and independent skill progress
- Achievements through Learning Engine state
- AI Coach history
- Gamification progress
- User preferences

The sync service reads these domains from their existing storage owners. It
does not create parallel XP, ELO, achievement or review stores. Vocabulary's
three existing persistence records are grouped inside one
`vocabularyReview` snapshot field and restored to their original keys after a
merge.

The snapshot is stored in `user_progress_snapshots` and wrapped in a versioned envelope so future backend migrations can evolve safely.

## Offline Merge Strategy

EngineerOS continues saving locally while offline. When Supabase mode is active:

- Auth state is restored by Supabase when available.
- Local progress continues through the existing storage wrapper.
- Cloud sync queues a local snapshot.
- Canonical local-store changes are debounced for 1.5 seconds before syncing.
- When the browser returns online, the app uploads the latest local snapshot.
- Queue items are retried up to 5 times. Items that reach the retry limit are removed and a clear sync error state is recorded.
- Remote and local snapshots are merged conservatively: numbers use the maximum value, arrays are de-duplicated, objects merge recursively, and strings currently prefer local values during conflict.

After a successful cloud write, the merged snapshot is applied back through the
existing storage wrapper. This completes the cloud load path for restored
sessions and new devices while preserving offline-first behavior.

This strategy prevents local progress loss while keeping the app usable without
a network connection.

Field-level `updatedAt` conflict resolution is planned for a later Phase 2 hardening sprint.

## Expected Tables

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null,
  engineering_discipline text not null,
  target_level text not null,
  location text not null,
  avatar_initials text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table public.user_progress_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  schema_version integer not null default 1,
  updated_at timestamptz not null
);
```

Row-level security should allow each authenticated user to read and write only their own rows.

## Security Model

- No Supabase service role key is used in the frontend.
- No AI vendor keys are stored in the browser.
- Supabase configuration uses Vite environment variables only.
- Direct database access is kept inside the auth data layer.
- Existing local storage remains namespaced through the shared storage wrapper.
- `user_progress_snapshots` RLS restricts reads and writes to
  `auth.uid() = user_id`.

## Sync Status UI

Profile displays one honest progress-storage state:

- Local only: local/demo authentication; no cloud claim.
- Cloud ready / queued / syncing / synced: Supabase adapter lifecycle.
- Offline: progress remains local until connectivity returns.
- Sync failed: local progress remains available and retry state is visible.

## Remaining Production Work

- Add a server-side audit log if compliance reporting is required.
- Add automated end-to-end tests against a staging Supabase project.
- Execute live two-user RLS isolation proof against a configured staging
  project.

## Sprint C Production Foundation

The production database foundation is now provided in:

`supabase/migrations/202606260001_engineeros_production_foundation.sql`

Tables:

- `profiles`
- `user_settings`
- `user_progress_snapshots`
- `assessment_snapshots`
- `task_attempts`
- `writing_attempts`
- `listening_attempts`
- `speaking_attempts`
- `vocabulary_reviews`
- `ai_sessions`
- `billing_customers`
- `subscription_status`

All tables enable Row Level Security. User-owned learning records are scoped to `auth.uid()`. Subscription status is readable by the signed-in owner and should be mutated by trusted backend or webhook code, not by browser business logic.

Conflict strategy for progress snapshots:

- local progress keeps a local `updatedAt` signal
- cloud snapshots keep `server_updated_at`
- the current production foundation documents last-write-wins with local offline queue protection
- richer field-level conflict resolution is reserved for a later backend hardening pass

Account deletion and export:

- user-owned rows cascade from `auth.users`
- production backend should expose account export before deletion
- billing/customer deletion must be coordinated with Stripe retention and legal requirements

Production setup:

1. Create a Supabase project.
2. Apply the Sprint C migration.
3. Configure `VITE_AUTH_PROVIDER=supabase`.
4. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Keep service-role keys on the backend only.

## Team Readiness Migration

`202606300001_team_readiness.sql` adds organizations, membership,
invitations and manager-safe progress summaries. Members may read only their
own summary while owners and managers may read summaries for their
organization. Raw writing, speaking and attempt payloads remain in their
existing private tables and are not exposed through the team summary model.

Invitation email delivery is not implemented by the local provider. Live Team
access requires the migration to be applied and two-user/manager RLS isolation
to be proven in staging.
