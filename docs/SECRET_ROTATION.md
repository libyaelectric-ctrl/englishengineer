# Secret Rotation Strategy

## Rotation Schedule

| Secret                         | Provider     | Rotation Frequency | Last Rotated |
| ------------------------------ | ------------ | ------------------ | ------------ |
| SUPABASE_ANON_KEY              | Supabase     | Annually           | -            |
| SUPABASE_SERVICE_ROLE_KEY      | Supabase     | Every 6 months     | -            |
| STRIPE_SECRET_KEY              | Stripe       | Every 12 months    | -            |
| STRIPE_WEBHOOK_SECRET          | Stripe       | Every 12 months    | -            |
| ANTHROPIC_API_KEY              | Anthropic    | Every 6 months     | -            |
| UPSTASH_REDIS_REST_TOKEN       | Upstash      | Every 12 months    | -            |
| ENGINEEROS_INTERNAL_API_SECRET | Self-managed | Every 90 days      | -            |

## Rotation Procedure

### 1. Pre-Rotation

- [ ] Verify new secret works in staging
- [ ] Update all deployment environments
- [ ] Schedule maintenance window if needed

### 2. Rotation Steps

1. Generate new secret in provider dashboard
2. Update Railway environment variables
3. Update Vercel environment variables (if frontend-accessible)
4. Deploy backend with new secrets
5. Verify health check passes
6. Monitor error rates for 1 hour

### 3. Post-Rotation

- [ ] Revoke old secret after 24-hour grace period
- [ ] Update this document with rotation date
- [ ] Notify team of successful rotation

## Emergency Rotation

If a secret is compromised:

1. Immediately revoke the compromised secret
2. Generate new secret
3. Update all environments
4. Deploy immediately (skip staging)
5. Monitor for unauthorized access

## Contacts

- Supabase: Dashboard → Settings → API
- Stripe: Dashboard → Developers → API Keys
- Anthropic: Console → API Keys
- Upstash: Console → Settings → REST API
