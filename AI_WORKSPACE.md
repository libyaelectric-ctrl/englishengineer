# EngineerOS AI Coach Workspace

The AI Workspace is now AI Coach PRO: safe by default, useful locally, and backend-proxy-ready for future real AI integration.

## Provider Behavior

- `VITE_AI_PROVIDER=mock` keeps the AI Coach fully local with deterministic mock coaching.
- `VITE_AI_PROVIDER=backend-proxy` uses `VITE_AI_PROXY_URL` only when it is configured.
- If the proxy URL is missing, times out, or returns an error, `AIService` falls back safely to `MockAIProvider`.
- The AI page shows the actual state: mock fallback, backend proxy configured, or backend proxy error.

## Security Boundary

The frontend never asks the learner for OpenAI, Anthropic, Gemini, or other vendor API keys. Real AI keys are not stored in localStorage and are not shipped to the browser. Production AI requires a server-side proxy that owns vendor credentials.

## Supported Operations

- `analyzeText`
- `rewriteText`
- `generatePractice`
- `evaluateEngineeringEnglish`
- `generateStudyPlan`
- `analyzeProgress`

## Coach Modes

- General Coach
- Writing Review
- Speaking Review
- Site Meeting Coach
- Technical Email Coach
- Vocabulary Coach
- Career English Coach

## Learning Context

AI Coach builds local context from existing Auth, Learning Engine, and Vocabulary Engine state:

- learner profile and target CEFR level
- XP, level, streak, ELO, and average score
- completed missions and recent sessions
- weak and strong skills
- weak vocabulary and retention signals

The coach does not duplicate learning state. It reads current stores/services and persists only coach sessions.

## Structured Output

Coach results include Summary, Strengths, Weaknesses, Corrections, Native rewrite, Technical vocabulary, Recommended next task, Estimated CEFR impact, and Suggested actions.

## Persistence and Analytics

Coach sessions, selected mode, latest input, structured result, provider status, and timestamps are stored through the existing storage wrapper. Dashboard and Analytics can show recent usage, most used coach mode, and suggested focus area.

## Future Backend Path

Configure a real backend proxy with:

```env
VITE_AI_PROVIDER=backend
VITE_AI_PROXY_URL=https://your-server.example.com/api/ai
```

The backend should accept the typed operation, prompt, coach mode, and context, then call the real AI provider server-side.

`backend-proxy` is still tolerated as a legacy alias, but `backend` is the preferred Phase 2 provider name.

## Backend Proxy Response Contract

The finalized response contract is:

```ts
{
  contractVersion: '2026-06-26.v1';
  requestId: string;
  operation: AIOperation;
  structuredResult?: AICoachResult;
  text?: string;
  error?: { code: string; message: string; retryable?: boolean };
}
```

Use `structuredResult` for AI Coach responses. Use `text` for plain completion responses. The frontend still tolerates older `result` or `message` fields as legacy fallback, but new backend implementations should return only `structuredResult` and/or `text`.
