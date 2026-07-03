# Railway Deployment Blueprint — Phase 1

This document outlines the DevOps audit and staging deployment preparation for the EngineerOS backend service on Railway.

---

## 🚦 Verified Deployment Parameters

| Metric | Status | Details |
| :--- | :---: | :--- |
| **Backend Entrypoint** | **PASS** | Entrypoint is `server.js` at the backend root, importing app startup from `src/app.js`. |
| **Start Script** | **PASS** | `package.json` contains `"start": "node server.js"`. |
| **Health Check Endpoint** | **PASS** | Endpoint `GET /api/health` returns public configuration availability status with HTTP 200. |
| **CORS Origins** | **PASS** | CORS settings allow origin matching dynamically through the `APP_ORIGIN` environment variable. |
| **NODE_ENV Handling** | **PASS** | Restricts local memory fallbacks and mandates Upstash/Supabase configuration when `NODE_ENV=production`. |
| **Graceful Startup** | **PASS** | Exposes version info and port logging in stdout. |
| **Graceful Shutdown** | **PASS** | Captured `SIGTERM` and `SIGINT` triggers to execute `server.close()` and cleanly flush open sockets with a 10s maximum timeout limit. |
| **Structured Logging** | **PASS** | Implemented standard structured logging for request IDs, unhandled API errors, and Stripe webhook payloads. |

---

## ⚙️ Staging Environment Settings (Railway)

The following variables must be configured in the Railway dashboard:

```ini
# Core Configuration
PORT=8080
NODE_ENV=production
APP_ORIGIN=https://engineeros-v2.vercel.app

# AI Provider Integration
AI_PROVIDER=openai  # mock, openai, or anthropic
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-proj-... # Required for openai provider

# Billing Integrations (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_... # Retrieve after deploying backend url

# Persistent Database (Supabase)
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...

# Rate Limiting Configuration
RATE_LIMIT_STORE=upstash
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 🛑 Graceful Terminate Script (`server.js`)

The startup entrypoint listens to lifecycle termination events:

```javascript
// Graceful shutdown handling
const shutdown = (signal) => {
  console.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.info('Http server closed cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Force exiting...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```
This is fully compatible with Railway's container orchestration cycle.
