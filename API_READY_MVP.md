# EngineerOS API-Ready MVP

EngineerOS remains local-first by default while exposing safe integration boundaries for future backend services.

## AI Integration

Default mode:

```text
VITE_AI_PROVIDER=mock
VITE_AI_PROXY_URL=
```

Real AI mode:

```text
VITE_AI_PROVIDER=backend-proxy
VITE_AI_PROXY_URL=https://your-backend.example.com/api/ai
```

The frontend sends operation requests to the backend proxy only. It does not request, store, or expose provider API keys in the browser.

Backend proxy responses should use this contract:

```ts
{
  structuredResult?: AICoachResult;
  text?: string;
}
```

AI Coach responses should prefer `structuredResult`; plain completion responses can return `text`. Legacy `result` and `message` fields are tolerated by the frontend only for backward compatibility.

## Auth Integration

Default mode:

```text
VITE_AUTH_PROVIDER=local
```

Supabase mode:

```text
VITE_AUTH_PROVIDER=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Supabase auth initializes only when all three values are present. If config is incomplete, EngineerOS logs a warning and falls back to local auth. Local auth keeps demo login and passwordless local profile creation.

## Learning Engines

Reading, Writing, Listening, Speaking, Dashboard, Analytics, Gamification, and localStorage persistence continue to use the existing Zustand and service architecture.
