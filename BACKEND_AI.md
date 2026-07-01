# Backend AI Integration

## OpenAI provider contract

The backend uses the OpenAI Chat Completions API consistently: `POST /v1/chat/completions`, a `messages` array containing the user prompt, and `choices[0].message.content` response parsing. Backend tests assert the endpoint, request body, and response shape. The Responses API contract is not mixed into this implementation.

## v4.0.1 P0 route security

AI operations are route-controlled: `coach`, `writing-review`, `assessment-feedback`, and `roleplay` map to their allowed internal operations. Protected routes require an internal bearer identity or a validated Supabase bearer token outside explicit local development bypass. AI keys remain backend-only. Per-user/IP limits default to 30 requests per 15 minutes.

Set `VITE_AI_PROXY_URL` to the AI base URL, normally `/api/ai`; the frontend provider selects the correct route. A backend text response without `structuredResult` remains visible but is labeled `Limited AI response` rather than presented as a complete structured assessment.

## Deployment proof

The source package includes provider contracts, validation, timeout/error handling and mock mode. Real-provider proof requires backend-only credentials, a deployed backend URL, a successful `/api/health` result and one provider response through the backend. Without that evidence, the product must remain labelled Mock fallback or Backend unavailable.

Current source version: **v4.0.1**. The backend contract is implemented, but a
live provider is not claimed without deployed credentials and verification.

AI backend contract exists, but live provider proof is not included in this package.

## v3.0.2 Backend Package

The source tree now includes a runnable `backend/` package. It exposes
`POST /api/ai/coach`, `/api/ai/writing-review`,
`/api/ai/assessment-feedback`, and `/api/ai/roleplay`. The backend validates
prompts, applies the configured timeout, maps provider failures to safe public
errors, and keeps vendor credentials server-side.

When `AI_PROVIDER` or its matching key is missing, the endpoint returns
`mode: "mock"`, `mockMode: true`, and text beginning with `[Mock AI]`. The
frontend preserves this label as `Mock AI via backend`; a connected mock
backend is never presented as real AI.

EngineerOS Phase 2 keeps all AI vendor communication behind a backend proxy. The frontend never calls OpenAI, Anthropic, Gemini, or any other AI vendor directly.

## Architecture

The AI layer preserves the existing provider pattern:

```text
AIPage / AI Coach
  -> AIService
  -> MockAIProvider or BackendProxyAIProvider
  -> backend proxy endpoint
  -> AI vendor from the server only
```

Frontend modules:

- `AIService`: selects the active provider and applies graceful mock fallback.
- `MockAIProvider`: deterministic local fallback for development and offline use.
- `BackendProxyAIProvider`: production-ready frontend client for the backend proxy.
- `AI Coach`: stores coach sessions and AI operation logs without secrets.

## Provider Selection

The active provider is environment-driven:

```env
VITE_AI_PROVIDER=mock
VITE_AI_PROXY_URL=
```

For backend proxy mode:

```env
VITE_AI_PROVIDER=backend
VITE_AI_PROXY_URL=https://your-backend.example.com/api/ai/coach
```

`backend-proxy` remains tolerated as a legacy alias, but `backend` is the preferred provider name for Phase 2.

The frontend config normalizes `backend-proxy` to `backend`, so runtime provider selection only needs to branch between `mock` and `backend`.

## Request Flow

1. AI Coach builds local learning context from existing Auth, Learning, Vocabulary, and Analytics sources.
2. `AIService` selects `BackendProxyAIProvider` only when backend mode and proxy URL are configured.
3. `BackendProxyAIProvider` sends a typed v1 request with operation, prompt, mode, context, and metadata.
4. The backend proxy validates the request and calls the AI vendor server-side.
5. The backend returns a typed v1 response.
6. The frontend validates the response shape.
7. If the proxy fails, times out, rate-limits, or returns malformed data, `AIService` falls back to `MockAIProvider`.

## Supported Operations

- `analyzeText`
- `rewriteText`
- `generatePractice`
- `evaluateEngineeringEnglish`
- `generateStudyPlan`
- `analyzeProgress`

## Backend Request Contract

Contract version: `2026-06-26.v1`

```ts
interface BackendProxyPayload {
  contractVersion: '2026-06-26.v1';
  operation:
    | 'analyzeText'
    | 'rewriteText'
    | 'generatePractice'
    | 'evaluateEngineeringEnglish'
    | 'generateStudyPlan'
    | 'analyzeProgress';
  modeId: string;
  modeName: string;
  prompt: string;
  context?: AICoachContext;
  metadata: {
    contractVersion: '2026-06-26.v1';
    requestId: string;
    sentAt: string;
    client: 'engineeros-web';
  };
}
```

Headers:

```text
Content-Type: application/json
X-EngineerOS-AI-Contract: 2026-06-26.v1
X-EngineerOS-Request-Id: <request-id>
```

## Backend Response Contract

```ts
interface BackendProxyResponse {
  contractVersion: '2026-06-26.v1';
  requestId: string;
  operation:
    | 'analyzeText'
    | 'rewriteText'
    | 'generatePractice'
    | 'evaluateEngineeringEnglish'
    | 'generateStudyPlan'
    | 'analyzeProgress';
  text?: string;
  structuredResult?: AICoachResult;
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
}
```

Use `structuredResult` for AI Coach responses. Use `text` for plain completion responses. Legacy `result` and `message` fields are tolerated only for backward compatibility and should not be used by new backends.

## Error Handling

The frontend maps backend failures into safe user-facing states:

- network failure
- 20 second timeout
- backend unavailable
- rate limit
- malformed response
- non-OK HTTP response

Retry policy:

- one safe retry for retryable network, rate-limit, or server errors
- no infinite retry loops
- timeout errors do not retry by default
- `AIService` gracefully falls back to mock output when backend mode fails
- malformed backend responses are treated as backend errors with a clear backend-error provider state; fallback output is marked through response metadata instead of being reported as a successful backend response

## Motion Dependency

The `motion` package is intentionally kept. It is used by `src/pages/ListeningPage.tsx` for `AnimatePresence` and `motion.div` transitions in the Listening Engine interface. No additional animation library is introduced.

## AI Session Logging

AI Coach persists non-sensitive operation logs:

- provider
- operation
- duration
- success/failure
- timestamp
- request ID
- error message when applicable

Logs do not store API keys, vendor secrets, or hidden backend credentials.

## Security Model

- No AI vendor key is stored in the frontend.
- No API key is requested from the user in the browser.
- No secret is stored in localStorage.
- Browser environment variables may contain only public configuration such as provider mode and proxy URL.
- Vendor-specific provider selection belongs to the backend.

## Future Provider Expansion

Future AI providers should be added behind the backend proxy first. The frontend should continue using `AIService` and provider interfaces without vendor-specific browser code.

Possible future backend providers:

- OpenAI
- Anthropic
- Gemini
- Azure OpenAI
- local enterprise model gateway

The frontend contract should remain stable unless a new version is explicitly introduced.

## Titan Backend Contract

EngineerOS v2.6.0 keeps the Titan backend contract in `src/contracts/backend` and verifies frontend fallback behavior through real browser E2E.

AI endpoints:

- `POST /api/ai/coach`
- `POST /api/ai/writing-review`
- `POST /api/ai/assessment-feedback`
- `POST /api/ai/roleplay`

The browser sends validated EngineerOS payloads only. Vendor routing, API keys, prompt hardening, rate limiting and AI observability belong on the backend.

Required request fields:

- `contractVersion`
- `operation`
- `modeId`
- `prompt`
- `metadata.requestId`
- `metadata.client = engineeros-web`

Required response fields:

- `contractVersion`
- `requestId`
- `operation`
- `success`
- `metadata`

Successful responses must include `structuredResult` or `text`. Failed responses must include `error`. Mock mode remains explicitly labelled and must never be presented as real backend AI.

The v3.0.2 backend additionally returns `provider`, `mode`, `mockMode`, and
`durationMs`. These trust fields do not contain credentials. Real provider
output requires `AI_PROVIDER=openai` plus `OPENAI_API_KEY`, or
`AI_PROVIDER=anthropic` plus `ANTHROPIC_API_KEY`, in the backend environment.

Health endpoint:

- `GET /api/health`

The health endpoint returns safe readiness flags only:

- app version
- environment
- AI backend configured true/false
- billing backend configured true/false
- Supabase configured true/false

It must never return secrets, raw provider keys, Stripe secrets, webhook secrets, or Supabase service-role keys.
