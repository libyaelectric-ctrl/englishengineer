# Incident Response Runbook

## Severity Levels

| Level | Description             | Response Time | Example                      |
| ----- | ----------------------- | ------------- | ---------------------------- |
| P0    | Service down, data loss | 15 minutes    | Auth broken, API unreachable |
| P1    | Major feature broken    | 1 hour        | Payment fails, OAuth error   |
| P2    | Minor feature broken    | 4 hours       | UI glitch, slow response     |
| P3    | Cosmetic issue          | Next sprint   | Typo, color mismatch         |

## Response Process

### 1. Acknowledge

- Post in #incidents Slack channel
- Create incident ticket
- Assign incident commander

### 2. Assess

- Identify affected services
- Determine severity level
- Check monitoring dashboards (Sentry, Railway, Vercel)

### 3. Mitigate

- Rollback if recent deploy caused issue
- Enable feature flags to disable affected feature
- Scale up if capacity issue

### 4. Resolve

- Fix root cause
- Deploy fix
- Verify fix in production

### 5. Post-Mortem

- Write incident report within 24 hours
- Identify prevention measures
- Update runbooks if needed

## Common Incidents

### Auth Service Down

**Symptoms:** Users cannot login, 401 errors
**Check:**

```bash
curl https://englishengineer-production.up.railway.app/api/health
```

**Fix:** Check Supabase status, verify env vars

### Payment Failures

**Symptoms:** Checkout returns error, subscriptions not activating
**Check:**

```bash
curl https://englishengineer-production.up.railway.app/api/billing/subscription-status
```

**Fix:** Verify Stripe keys, check webhook logs

### High Latency

**Symptoms:** Slow page loads, API timeouts
**Check:** Railway metrics, Vercel analytics
**Fix:** Scale up, check database queries, enable caching

### Frontend Build Failure

**Symptoms:** Vercel deploy fails, new features not live
**Check:** Vercel build logs
**Fix:** Fix TypeScript errors, resolve dependency issues
