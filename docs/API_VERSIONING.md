# API Versioning

## Overview

EngineerOS uses URL-based API versioning to ensure backward compatibility and smooth migrations.

## Versioning Strategy

### URL-Based Versioning

All API endpoints are versioned via URL prefix:

```
/api/v1/health
/api/v1/billing/subscription-status
/api/v1/ai/coach
```

### Version Lifecycle

| Phase | Duration | Description |
|-------|----------|-------------|
| Active | 12 months | Full support, new features |
| Deprecated | 6 months | Security fixes only |
| Sunset | 0 | Removed, returns 410 Gone |

## Current Endpoints

### v1 (Current)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/billing/create-checkout-session` | POST | Create Stripe checkout |
| `/api/v1/billing/create-topup-session` | POST | Create top-up checkout |
| `/api/v1/billing/create-customer-portal-session` | POST | Stripe portal |
| `/api/v1/billing/subscription-status` | GET | Get subscription status |
| `/api/v1/ai/coach` | POST | AI coaching session |
| `/api/v1/ai/stream` | POST | AI streaming response |
| `/api/v1/vocabulary/lookup` | POST | Vocabulary lookup |
| `/api/v1/workspace` | GET/POST | Workspace operations |
| `/api/v1/admin/audit-logs` | GET | Admin audit logs |
| `/api/webhooks/stripe` | POST | Stripe webhook |

### Backward Compatibility

Legacy endpoints redirect to v1:

```
/api/health → /api/v1/health
/api/billing/... → /api/v1/billing/...
```

## Implementation

### Route Registration

```javascript
// backend/src/app.js
const v1Router = express.Router();

// Register v1 routes
registerAIRoutes(v1Router, ...);
registerBillingRoutes(v1Router, ...);
registerVocabularyRoutes(v1Router, ...);
registerWorkspaceRoutes(v1Router, ...);

app.use('/api/v1', v1Router);

// Backward compatibility redirects
app.use('/api/health', (req, res) => res.redirect(301, '/api/v1/health'));
```

### Version Header (Optional)

Clients can specify version via header:

```
X-API-Version: v1
```

If not specified, defaults to latest version.

## Migration Guide

### For API Consumers

1. Update base URL from `/api/` to `/api/v1/`
2. Test all endpoints
3. Update any hardcoded paths

### For Backend Developers

1. All new endpoints go under `/api/v1/`
2. Never modify existing v1 endpoints
3. Create v2 for breaking changes
4. Add deprecation headers for sunset endpoints

## Deprecation Headers

When an endpoint is deprecated:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: 2027-01-01
Link: </api/v2/endpoint>; rel="successor-version"
```

## Version Comparison

### v1 → v2 (Future)

Planned breaking changes for v2:

- Response format standardization
- Pagination cursor-based
- Rate limit headers
- HATEOAS links

## Security

- All versions require authentication (where applicable)
- Webhook endpoints are version-agnostic
- Rate limiting applies to all versions equally

## Monitoring

- Track API version usage via audit logs
- Monitor deprecated endpoint usage
- Alert on sunset endpoint access

## Last Updated

- **Date:** 2026-07-12
- **Current Version:** v1
- **Next Review:** 2026-10-12
