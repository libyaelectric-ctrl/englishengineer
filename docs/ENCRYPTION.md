# Encryption Policy

## Overview

This document describes encryption practices for EngineerOS data at rest and in transit.

## Encryption at Rest

### Supabase (PostgreSQL)

Supabase provides automatic encryption at rest:

| Feature | Status | Details |
|---------|--------|---------|
| Disk Encryption | ✅ Enabled | AES-256 via AWS EBS |
| Column-level Encryption | ⚠️ Manual | For sensitive fields |
| Backup Encryption | ✅ Enabled | Automatic with Supabase |

### Sensitive Data Fields

| Data | Table | Encryption Method |
|------|-------|-------------------|
| User Email | auth.users | Supabase default |
| Stripe Customer ID | subscription_status | Supabase default |
| API Keys | Environment vars | Not stored in DB |
| JWT Secrets | Environment vars | Not stored in DB |

### Environment Variables (Secrets)

| Secret | Storage | Access |
|--------|---------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Railway env | Backend only |
| `STRIPE_SECRET_KEY` | Railway env | Backend only |
| `ANTHROPIC_API_KEY` | Railway env | Backend only |
| `UPSTASH_REDIS_REST_TOKEN` | Railway env | Backend only |
| `SUPABASE_ANON_KEY` | Vercel env | Frontend only |

**Never store secrets in:**
- Code repositories
- Client-side code
- Logs or audit trails
- Database tables

## Encryption in Transit

### TLS Configuration

| Service | TLS Version | Status |
|---------|-------------|--------|
| Supabase | TLS 1.3 | ✅ Enforced |
| Stripe API | TLS 1.2+ | ✅ Required |
| Vercel | TLS 1.3 | ✅ Default |
| Railway | TLS 1.2+ | ✅ Default |
| Anthropic API | TLS 1.2+ | ✅ Required |

### HTTPS Enforcement

- **Frontend:** Vercel serves over HTTPS by default
- **Backend:** Railway provides TLS termination
- **API Calls:** All external API calls use HTTPS

### Certificate Management

- Handled by cloud providers (Supabase, Vercel, Railway)
- Automatic renewal for Let's Encrypt certificates
- No manual certificate management required

## Data Classification

| Classification | Examples | Protection |
|----------------|----------|------------|
| **Public** | App name, version | None required |
| **Internal** | Error logs, metrics | Access control |
| **Confidential** | User emails, subscription data | Encryption + Access control |
| **Restricted** | API keys, secrets | Encryption + Strict access |

## Implementation Details

### Supabase RLS

Row Level Security enforces data isolation:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users see own data" ON workspaces
  FOR SELECT USING (auth.uid() = user_id);
```

### Stripe Webhook Verification

Webhook signatures verify request authenticity:

```javascript
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret
);
```

### JWT Validation

Supabase JWTs are validated on every authenticated request:

```javascript
const { data: { user }, error } = await supabase.auth.getUser(token);
```

## Compliance

### GDPR/KVKK Requirements

| Requirement | Implementation |
|-------------|----------------|
| Data encryption at rest | ✅ Supabase default |
| Data encryption in transit | ✅ TLS enforced |
| Secure key management | ✅ Environment variables |
| Access logging | ✅ Audit logs |
| Right to erasure | ✅ Account deletion |

### OWASP Top 10 Coverage

| Vulnerability | Protection |
|---------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | Supabase Auth, JWT validation |
| Sensitive Data Exposure | Encryption, environment variables |
| XML External Entities | N/A (JSON APIs) |
| Broken Access Control | RLS policies, RBAC middleware |
| Security Misconfiguration | Helmet.js, CORS |
| Cross-Site Scripting | React auto-escaping, CSP |
| Insecure Deserialization | Input validation with Zod |
| Known Vulnerabilities | Dependabot, npm audit |
| Insufficient Logging | Audit logs, Sentry |

## Monitoring

- **Supabase Dashboard:** Database encryption status
- **Sentry:** Security errors and anomalies
- **Audit Logs:** Access patterns and suspicious activity

## Last Review

- **Date:** 2026-07-12
- **Reviewer:** EngineerOS Team
- **Status:** Compliant
