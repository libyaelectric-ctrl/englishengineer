# Observability & Monitoring Strategy

## Overview

EngineerOS uses a multi-layered observability strategy covering error monitoring, performance tracking, logging, and health checks across frontend and backend services.

## Error Monitoring

### Backend (Sentry Node.js)

- **SDK:** `@sentry/node` v8.x
- **Initialization:** `backend/src/app.js` lines 39-46
- **Error Capture:** Unhandled exceptions captured via `Sentry.captureException()` in the global error handler
- **Configuration:**
  - DSN: `SENTRY_DSN` environment variable
  - Environment: `NODE_ENV`
  - Traces Sample Rate: 10% in production, 100% in development
- **Scope:** All unhandled exceptions and rejected promises

### Frontend (Sentry React)

- **SDK:** `@sentry/react` v8.x
- **Initialization:** `src/core/observability/observability.service.ts` → `ObservabilityService.init()`
- **Called at:** `src/main.tsx` (app startup)
- **Configuration:**
  - DSN: `VITE_SENTRY_DSN` environment variable
  - Environment: `VITE_ENVIRONMENT_MODE`
  - Integrations: Browser Tracing
  - Traces Sample Rate: Configurable via `VITE_ERROR_MONITORING_SAMPLE_RATE`
- **Scope:** Unhandled errors, React component errors (via ErrorBoundary)

## Performance Monitoring

### Frontend

- **Lighthouse CI:** Automated performance scoring on every CI run
  - Target: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90
- **Bundle Analysis:** Vite build output monitored for chunk sizes
- **Custom Metrics:** `ObservabilityService.logPerformance()` for tracking operation durations

### Backend

- **k6 Load Testing:** `scripts/performance/load-test.k6.js`
  - Normal load: 50 VUs, target p95 < 5ms
  - Spike test: 200 VUs ramped in 9s
  - Soak test: 20 VUs sustained for extended period
- **API Response Times:** Tracked via rate-limit response headers (`X-RateLimit-Reset`)

## Health Checks

### Backend Health Endpoint

- **Route:** `GET /api/health` (also available at `GET /api/v1/health`)
- **Response:** JSON with service status, configuration checks, and version info
- **Checks performed:**
  - AI provider configuration
  - Stripe billing configuration
  - Supabase database configuration
  - Rate limiter store (Upstash vs memory)

### Frontend Health Check

- **Service:** `ObservabilityService.getHealthCheck()`
- **Returns:** Environment validation, monitoring status, configuration checks

## Logging

### Backend

- **Structured Logging:** Console-based with consistent format
- **Request Logging:** HTTP method, path, status code, duration
- **Error Logging:** Full stack traces with context

### Frontend

- **Logger Service:** `src/shared/logger.ts`
- **Levels:** `i` (info), `w` (warning), `e` (error)
- **Context:** prefixed with `[EngVox]` for easy filtering

## Alerting & Incident Response

### Severity Levels

| Level         | Description                            | Response Time |
| ------------- | -------------------------------------- | ------------- |
| P0 - Critical | Service down, data loss risk           | Immediate     |
| P1 - High     | Major feature broken, security issue   | < 1 hour      |
| P2 - Medium   | Degraded performance, non-critical bug | < 4 hours     |
| P3 - Low      | Minor issue, cosmetic                  | Next sprint   |

### Incident Response Process

1. **Detection:** Sentry alert or user report
2. **Triage:** Assess severity and impact
3. **Mitigation:** Apply hotfix or rollback
4. **Resolution:** Root cause analysis and permanent fix
5. **Post-mortem:** Document learnings and preventive measures

## Environment Variables

| Variable                            | Service  | Purpose                           |
| ----------------------------------- | -------- | --------------------------------- |
| `SENTRY_DSN`                        | Backend  | Sentry Data Source Name           |
| `VITE_SENTRY_DSN`                   | Frontend | Sentry Data Source Name           |
| `VITE_ERROR_MONITORING_PROVIDER`    | Frontend | Set to `sentry` to enable         |
| `VITE_ERROR_MONITORING_SAMPLE_RATE` | Frontend | 0-1, percentage of errors to send |

## Dashboard Access

- **Sentry:** https://sentry.io (project: englishengineer)
- **Vercel Analytics:** https://vercel.com/engineer-os/englishengineer/analytics
- **Railway Logs:** https://railway.app dashboard → englishengineer service
- **Supabase Dashboard:** https://supabase.com dashboard → englishengineer project
