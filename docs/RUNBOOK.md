# EngineerOS Runbook

## Incident Response

### Severity Levels

| Level | Description             | Response Time | Escalation        |
| ----- | ----------------------- | ------------- | ----------------- |
| P0    | Complete outage         | 15 min        | Immediate         |
| P1    | Major feature broken    | 1 hour        | Within 4 hours    |
| P2    | Minor bug / degradation | 4 hours       | Next business day |
| P3    | Cosmetic / enhancement  | 1 week        | Next sprint       |

### P0 Response Checklist

1. **Acknowledge** (0-5 min)
   - Post in incident channel
   - Assign incident commander

2. **Assess** (5-15 min)
   - Check Vercel status: https://status.vercel.com
   - Check Render status: https://status.render.com
   - Check Supabase status: https://status.supabase.com
   - Check Sentry for error spikes

3. **Mitigate** (15-30 min)
   - Rollback to last known good deployment
   - Enable maintenance mode if needed
   - Communicate to users via status page

4. **Resolve** (30+ min)
   - Fix root cause
   - Deploy fix
   - Post-incident review within 48 hours

### Rollback Procedure

```bash
# Frontend (Vercel)
vercel --prod --confirm  # Deploy previous commit

# Backend (Render)
git revert HEAD
git push origin main
```

## Deployment

### Pre-Deploy Checklist

- [ ] All CI checks pass
- [ ] Coverage thresholds met
- [ ] Bundle size within budget
- [ ] Security audit clean
- [ ] Dependency Cruiser passes
- [ ] E2E tests pass

### Deploy Steps

1. **Staging**

   ```bash
   git checkout -b release/vX.Y.Z
   git push origin release/vX.Y.Z
   # Vercel preview auto-deploys
   # Render staging auto-deploys
   ```

2. **Smoke Tests**

   ```bash
   npm run test:smoke
   npm run test:e2e
   ```

3. **Production**
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   # GitHub Actions auto-deploys
   ```

### Post-Deploy Verification

- [ ] Health check endpoint responds 200
- [ ] Sentry shows no new errors
- [ ] Vercel analytics shows normal traffic
- [ ] Stripe webhooks receiving events

## Monitoring

### Key Metrics

| Metric                  | Target  | Alert Threshold |
| ----------------------- | ------- | --------------- |
| Uptime                  | 99.9%   | < 99.5%         |
| API Response Time (p95) | < 500ms | > 1s            |
| Error Rate              | < 0.1%  | > 1%            |
| Bundle Size (JS)        | < 1MB   | > 1.2MB         |
| AI Response Time        | < 5s    | > 10s           |

### Dashboards

- **Vercel Analytics**: https://vercel.com/dashboard
- **Render Dashboard**: https://dashboard.render.com
- **Sentry**: https://sentry.io/organizations/engineeros
- **Supabase**: https://app.supabase.com/project/xxx
- **Stripe**: https://dashboard.stripe.com

## Contacts

| Role  | Name            | Email                   | Slack          |
| ----- | --------------- | ----------------------- | -------------- |
| Owner | Özcan ERENSAYIN | libyaelectric@gmail.com | @libyaelectric |

## Last Updated

- **Date:** 2026-07-27
