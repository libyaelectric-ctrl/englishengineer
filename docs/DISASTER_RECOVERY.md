# Disaster Recovery Plan

## Overview

This document outlines procedures for recovering EngineerOS from various disaster scenarios.

## Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

| Scenario | RTO | RPO | Priority |
|----------|-----|-----|----------|
| Database corruption | 4 hours | 1 hour | Critical |
| Complete data loss | 8 hours | 24 hours | Critical |
| Service outage | 1 hour | 0 | High |
| Security breach | 2 hours | 24 hours | Critical |

## Scenarios and Recovery Procedures

### 1. Database Corruption

**Detection:**
- Application errors on data access
- Constraint violations
- Unexpected data states

**Recovery Steps:**
1. **Assess damage** — Identify affected tables/rows
2. **Point-in-time recovery** (if Pro plan):
   - Supabase Dashboard → Database → Backups
   - Select restore point before corruption
3. **Manual restore** (if no PITR):
   - Restore from latest pg_dump
   - Apply WAL logs if available
4. **Verify integrity:**
   ```sql
   -- Check table integrity
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
   FROM pg_stat_user_tables;
   
   -- Check for orphaned records
   SELECT COUNT(*) FROM workspaces WHERE user_id NOT IN (SELECT id FROM auth.users);
   ```
5. **Resume operations** — Test all API endpoints

### 2. Complete Data Loss

**Recovery Steps:**
1. **Provision new Supabase project**
2. **Restore from backup:**
   ```bash
   pg_restore "postgresql://..." --verbose --clean backup_latest.dump
   ```
3. **Reapply RLS policies:**
   ```bash
   supabase db push
   ```
4. **Update environment variables:**
   - Vercel: Update `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Railway: Update `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
5. **Verify all services**

### 3. Service Outage (Railway/Vercel)

**Recovery Steps:**
1. **Check status pages:**
   - Vercel: https://vercel.status.com
   - Railway: https://status.railway.app
2. **If provider issue:** Wait for resolution
3. **If configuration issue:**
   - Check recent deployments
   - Rollback to last working deployment
4. **If code issue:**
   - Revert to last known good commit
   - Deploy hotfix

### 4. Security Breach

**Immediate Actions:**
1. **Rotate all secrets:**
   - Supabase: Settings → API → Rotate keys
   - Stripe: Dashboard → API Keys → Roll key
   - Anthropic: Console → API Keys → Revoke
   - Upstash: Console → Settings → Reset token
2. **Enable maintenance mode** (if possible)
3. **Notify affected users** (if data exposed)

**Investigation:**
1. **Review audit logs:**
   ```sql
   SELECT * FROM audit_logs 
   WHERE action IN ('login', 'signup', 'data_access')
   ORDER BY timestamp DESC LIMIT 100;
   ```
2. **Check for unauthorized access**
3. **Review RLS policies** for bypasses
4. **Document findings**

**Recovery:**
1. Patch vulnerability
2. Deploy fix
3. Monitor for recurrence

## Communication Plan

| Audience | Method | Timing |
|----------|--------|--------|
| Internal team | Direct message | Immediately |
| Users | Email + Status page | Within 1 hour |
| Stakeholders | Report | Within 24 hours |

## Backup Verification Schedule

| Task | Frequency | Owner | Last Verified |
|------|-----------|-------|---------------|
| Automated backups | Daily (Supabase) | System | N/A |
| Manual pg_dump | Weekly | DevOps | TBD |
| Restore test | Quarterly | DevOps | TBD |
| Full DR drill | Annually | Team | TBD |

## Contact Information

| Service | Support | Dashboard |
|---------|---------|-----------|
| Supabase | support@supabase.com | https://app.supabase.com |
| Railway | support@railway.app | https://railway.app/dashboard |
| Vercel | support@vercel.com | https://vercel.com/dashboard |
| Stripe | support@stripe.com | https://dashboard.stripe.com |

## Recovery Checklist

- [ ] Backup available and verified
- [ ] New environment provisioned (if needed)
- [ ] Secrets rotated (if security incident)
- [ ] Data restored and integrity checked
- [ ] Application deployed and tested
- [ ] DNS/URLs updated (if needed)
- [ ] Users notified (if applicable)
- [ ] Incident documented
