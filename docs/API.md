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
POST /api/speaking/submit
GET /api/speaking/stats
```

## Rate Limiting

- Global: 100 requests per 15 minutes per IP
- AI endpoints: 30 requests per 15 minutes per user
- Billing: 10 requests per 15 minutes per user

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request body or parameters |
| 401 | Authentication required |
| 403 | Insufficient permissions |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | Service unavailable |
