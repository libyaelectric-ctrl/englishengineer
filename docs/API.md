# EngineerOS API Reference

Base URL: `https://englishengineer-production.up.railway.app`

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <supabase_access_token>
```

### OAuth Authentication (Google)

```bash
# 1. Redirect user to:
https://wxabrwzitwsjtpmlvvqe.supabase.co/auth/v1/authorize?provider=google&redirect_to=https://englishengineer.vercel.app/auth/callback

# 2. User authenticates with Google
# 3. Supabase redirects to /auth/callback with tokens
# 4. Client-side exchanges code for session
```

### Token Refresh

Tokens auto-refresh. If expired, call:

```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

## Rate Limiting

API endpoints are rate-limited:

| Endpoint            | Limit        | Window     |
| ------------------- | ------------ | ---------- |
| `/api/ai/*`         | 30 requests  | 15 minutes |
| `/api/billing/*`    | 100 requests | 15 minutes |
| `/api/vocabulary/*` | 60 requests  | 15 minutes |
| `/api/reading/*`    | 60 requests  | 15 minutes |
| `/api/workspaces/*` | 60 requests  | 15 minutes |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Health Check

```
GET /api/health
```

**Response:**

```json
{
  "ok": true,
  "status": "healthy",
  "version": "4.0.1",
  "checks": {
    "ai": { "configured": true },
    "stripe": { "configured": true },
    "supabase": { "configured": true, "reachable": true }
  }
}
```

### AI Coach

```
POST /api/ai/coach
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Analyze my engineering English progress",
  "operation": "analyzeProgress"
}
```

**Operations:** `analyzeProgress`, `evaluateEngineeringEnglish`, `analyzeText`, `generatePractice`

### Vocabulary Lookup

```
GET /api/vocabulary/lookup?word=panel&targetLang=tr
```

**Response:**

```json
{
  "word": "panel",
  "phonetic": "/ˈpæn.əl/",
  "definitions": ["A board that contains electrical controls"],
  "translation": "panel",
  "source": "Free Dictionary API",
  "cached": false
}
```

### Billing

```
POST /api/billing/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "planId": "pro",
  "successUrl": "https://englishengineer.vercel.app/dashboard",
  "cancelUrl": "https://englishengineer.vercel.app/pricing"
}
```

### Progress Overview

```
GET /api/progress/overview
Authorization: Bearer <token>
```

### Speaking

```
GET /api/speaking/prompts
Authorization: Bearer <token>
```

**Response:**

```json
{
  "prompts": [
    {
      "id": "sp-001",
      "title": "Site Meeting Update",
      "scenario": "You are at a construction site meeting",
      "difficulty": "intermediate"
    }
  ]
}
```

```
POST /api/speaking/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "missionId": "sp-001",
  "audioUrl": "https://example.com/recording.wav"
}
```

**Response:**

```json
{
  "success": true,
  "score": 85,
  "feedback": {
    "pronunciation": "Good clarity on technical terms",
    "fluency": "Natural pace with minor hesitations"
  }
}
```

### Grammar

```
POST /api/grammar/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "result": "correct"
}
```

**Response:**

```json
{
  "success": true,
  "ruleId": "grammar-001",
  "result": "correct",
  "updatedAt": "2025-07-24T12:00:00.000Z"
}
```

### Reading

```
GET /api/reading/feed?limit=10&offset=0
Authorization: Bearer <token>
```

**Response:**

```json
{
  "items": [],
  "total": 0,
  "limit": 10,
  "offset": 0
}
```

```
POST /api/reading/:id/score
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85
}
```

### Writing

```
GET /api/writing/prompts?limit=10&offset=0
Authorization: Bearer <token>
```

```
POST /api/writing/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "promptId": "wp-001",
  "content": "Dear Site Manager, I am writing to inform you about..."
}
```

**Response:**

```json
{
  "success": true,
  "id": "submission-001",
  "score": 78,
  "grammarScore": 82,
  "vocabularyScore": 75,
  "feedback": {}
}
```

### Listening

```
GET /api/listening/feed?limit=10&offset=0
Authorization: Bearer <token>
```

```
POST /api/listening/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 90
}
```

### Admin

```
GET /api/admin/stats
Authorization: Bearer <token>
```

```
GET /api/admin/audit-logs?limit=100&offset=0
Authorization: Bearer <token>
```

## Rate Limiting

- Global: 100 requests per 15 minutes per IP
- AI endpoints: 30 requests per 15 minutes per user
- Billing: 10 requests per 15 minutes per user

## Error Codes

| Code | Description                        |
| ---- | ---------------------------------- |
| 400  | Invalid request body or parameters |
| 401  | Authentication required            |
| 403  | Insufficient permissions           |
| 429  | Rate limit exceeded                |
| 500  | Internal server error              |
| 503  | Service unavailable                |
