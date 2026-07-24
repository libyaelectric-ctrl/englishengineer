# Monitoring Guide

## Overview

EngineerOS uses a multi-layered monitoring approach with automated health checks, error tracking, and performance metrics.

## Health Check Endpoints

### Frontend
- **URL:** `https://englishengineer.vercel.app`
- **Check:** HTTP 200 response
- **Frequency:** Every 30 minutes (GitHub Actions)

### Backend
- **URL:** `https://englishengineer-production.up.railway.app/api/health`
- **Check:** JSON response with `ok: true`
- **Frequency:** Every 30 minutes (GitHub Actions)

### API Documentation
- **URL:** `https://englishengineer-production.up.railway.app/api-docs`
- **Check:** HTTP 200 response
- **Frequency:** Every 30 minutes

## Error Tracking

### Sentry Integration
- **Frontend:** `@sentry/react` (disabled for bundle optimization)
- **Backend:** `@sentry/node` (active in production)
- **DSN:** Configured via `VITE_SENTRY_DSN` and `SENTRY_DSN`
- **Sample Rate:** Configurable via `VITE_ERROR_MONITORING_SAMPLE_RATE`

### CSP Violation Reporting
- **Endpoint:** `/api/csp-report`
- **Format:** `application/csp-report`
- **Logging:** Winston logger

## Performance Metrics

### Core Web Vitals
- **Collection:** `web-vitals` library
- **Metrics:** CLS, FID, FCP, LCP, TTFB
- **Reporting:** Console logging in production

### Bundle Size
- **Budget:** JS < 2MB, CSS < 200KB
- **Monitoring:** CI pipeline checks
- **Tool:** `rollup-plugin-visualizer` (optional)

## Load Testing

### Tools
- **k6:** Load, stress, and scalability tests
- **Location:** `scripts/performance/`
- **Schedule:** Weekly (Monday 02:00 UTC)

### Test Scenarios
1. **Normal Load:** 50 VUs, 15s duration
2. **Spike Test:** 20→100 VUs
3. **Stress Test:** 50→100 VUs
4. **Scalability:** 10→100→200 VUs

## Uptime Monitoring

### Automated Checks
- Health check workflow runs every 30 minutes
- Dependency audit runs weekly
- Load tests run weekly

### Manual Verification
```bash
# Check frontend
curl -s -o /dev/null -w "%{http_code}" https://englishengineer.vercel.app

# Check backend
curl -s https://englishengineer-production.up.railway.app/api/health

# Check response time
time curl -s https://englishengineer-production.up.railway.app/api/health > /dev/null
```

## Alerting

### Critical Alerts
- Health check fails → GitHub Actions notification
- High error rate → Sentry alert
- Bundle size exceeds budget → CI failure

### Warning Alerts
- Moderate vulnerabilities detected
- Outdated dependencies
- Performance regression

## Dashboards

### Available Dashboards
1. **Vercel Analytics:** Frontend performance, Web Vitals
2. **Railway Metrics:** Backend resource usage
3. **Sentry:** Error tracking, performance
4. **GitHub Actions:** CI/CD pipeline status

## Incident Response

### Severity Levels
- **P0 (Critical):** Service completely down
- **P1 (High):** Major feature broken
- **P2 (Medium):** Minor feature broken
- **P3 (Low):** Cosmetic issue

### Response Steps
1. Identify severity level
2. Check monitoring dashboards
3. Review recent deployments
4. Apply fix or rollback
5. Create incident report
6. Post-mortem for P0/P1
