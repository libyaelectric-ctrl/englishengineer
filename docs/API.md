# EngineerOS API Reference

Base URL: `https://englishengineer-production.up.railway.app`

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <supabase_access_token>
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
