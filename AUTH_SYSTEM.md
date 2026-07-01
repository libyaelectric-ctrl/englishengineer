# EngineerOS Authentication & Identity System

## v4.0.1 production guard

Local authentication is explicitly a demo/development adapter. Production blocks it unless `VITE_ALLOW_LOCAL_AUTH=true` is deliberately supplied; this override is not recommended for a public deployment. Supabase is the production provider. Browser requests forward the Supabase access token to protected backend routes, while internal backend secrets are never exposed to frontend code.

## Revision Status

Local auth remains the default provider. Supabase auth is now a real optional provider initialized only when:

```text
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

If Supabase mode is requested but env is incomplete, EngineerOS logs a safe warning and falls back to local auth. Demo login remains local-only. Supabase mode supports email/password sign in and sign up through `@supabase/supabase-js`.

The browser uses only the public Supabase anon key expected by Supabase client apps. AI provider secrets are never stored in localStorage or requested from the user in the frontend.

This document outlines the architecture, data models, and operation of the local-first authentication system implemented for EngineerOS. The system now includes a production Supabase adapter and cloud sync data layer while preserving local mode for development and offline use.

---

## 1. Architectural Strategy: Local-First

The current implementation is **local-first**, persisting all credentials and profile structures directly in `localStorage` through type-safe namespaces.

By defining an abstract asynchronous Service API (`AuthService`), the UI components and state machines interact with standard `Promises`. This means transitioning from a local store to an API-driven backend requires **zero modifications to front-end page components**.

---

## 2. User Data Model

The `UserProfile` contains both typical identity fields and engineering-focused strategic vectors:

```typescript
export interface UserProfile {
  id: string; // Unique developer index node
  displayName: string; // Legal or preferred system alias
  email: string; // E-mail node identifier
  role: string; // Current professional engineering role
  engineeringDiscipline: string; // Technical specialization (e.g. Electrical Engineering)
  targetLevel: string; // Strategic target level for curricula planning
  location: string; // Location node (for standup acoustic adaptivity)
  avatarInitials: string; // Extracted display initials (e.g., "AM")
  createdAt: string; // ISO Timestamp of registry creation
  updatedAt: string; // ISO Timestamp of last commit
}
```

---

## 3. Route Protection Mechanism

A robust, reactive router guard (`AuthGuard`) envelopes the application layout:

1. **Path-Level Interception:** The router configuration (`src/routes/router.tsx`) wraps the core `AppShell` layout with `<AuthGuard>`.
2. **Session Verification:** On initial load, the guard queries the asynchronous `AuthStore` initialization routine.
3. **Transition Fallbacks:** If the verification resolves to `unauthenticated`, the client is gracefully navigated to `/login`, preserving the origin pathway via state variables for seamless post-login redirection.

### Protected Views

- `/dashboard` (Command Center)
- `/reading`
- `/writing`
- `/listening`
- `/speaking`
- `/analytics`
- `/gamification`
- `/curriculum`
- `/offline`
- `/ai`

### Public Views

- `/login` (System Authentication)

---

## 4. Supabase Production Adapter

Sprint 15 finalizes Supabase as the production auth adapter without replacing the existing provider architecture:

1. `src/features/auth/supabase.client.ts` owns client initialization, session persistence, token refresh and URL session detection.
2. `SupabaseAuthAdapter` supports email/password sign in, sign up, logout, profile loading, profile updates and password reset preparation.
3. `src/features/auth/cloud-sync.service.ts` uploads versioned progress snapshots for learning, vocabulary, achievements, AI Coach, gamification and user preferences.
4. Local auth remains the default unless `VITE_AUTH_PROVIDER=supabase` and both Supabase env values are present.

See `SUPABASE.md` for the database table contract, offline merge strategy and row-level security expectations.

---

## 5. Intentionally Deferred Capabilities (Next Sprint)

To preserve the minimalist, performant, and reliable offline-first design during this sprint, the following items are purposefully deferred:

- **Supabase SQL migrations:** Table creation and RLS policies belong in the backend/deployment track.
- **Visible sync status UI:** Cloud sync state is stored, but no new dashboard widget was added in this sprint.
- **Enterprise identity:** OAuth, SSO and organization management are Phase 2 production extensions.
