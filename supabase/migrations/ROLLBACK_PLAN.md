# Migration Rollback Plan

## Overview

This document provides rollback procedures for each migration.

## Rollback Procedures

### 1. Foundation Migration (202606260001)

**Tables Created:** profiles, user_settings, vocabulary_reviews, grammar_progress, assessment_snapshots, task_attempts, writing_attempts, listening_attempts, speaking_attempts, ai_sessions, billing_customers, subscription_status, stripe_processed_events, user_progress_snapshots

**Rollback:**

```sql
-- WARNING: This will delete all data in these tables
DROP TABLE IF EXISTS public.user_progress_snapshots CASCADE;
DROP TABLE IF EXISTS public.stripe_processed_events CASCADE;
DROP TABLE IF EXISTS public.subscription_status CASCADE;
DROP TABLE IF EXISTS public.billing_customers CASCADE;
DROP TABLE IF EXISTS public.ai_sessions CASCADE;
DROP TABLE IF EXISTS public.speaking_attempts CASCADE;
DROP TABLE IF EXISTS public.listening_attempts CASCADE;
DROP TABLE IF EXISTS public.writing_attempts CASCADE;
DROP TABLE IF EXISTS public.task_attempts CASCADE;
DROP TABLE IF EXISTS public.assessment_snapshots CASCADE;
DROP TABLE IF EXISTS public.grammar_progress CASCADE;
DROP TABLE IF EXISTS public.vocabulary_reviews CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

### 2. Stripe Events (202606270001)

**Rollback:**

```sql
DROP TABLE IF EXISTS public.stripe_processed_events CASCADE;
```

### 3. Team Readiness (202606300001)

**Tables Created:** organizations, organization_members, organization_invitations, team_progress_summaries

**Rollback:**

```sql
DROP TABLE IF EXISTS public.team_progress_summaries CASCADE;
DROP TABLE IF EXISTS public.organization_invitations CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
```

### 4. RLS Tightening (202607100003)

**Rollback:**

```sql
-- Drop new policies
DROP POLICY IF EXISTS "audit_logs_service_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_service_select" ON public.audit_logs;

-- Restore old policies
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (true);
```

### 5. Workspaces RLS (202607100004)

**Rollback:**

```sql
-- Drop workspace RLS policies
DROP POLICY IF EXISTS "workspaces_insert" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete" ON public.workspaces;
```

### 6. Knowledge Pool (202607120001)

**Rollback:**

```sql
DROP TABLE IF EXISTS public.knowledge_pool_entries CASCADE;
```

### 7. Content Generation Log (202607120002)

**Rollback:**

```sql
DROP TABLE IF EXISTS public.content_generation_log CASCADE;
```

## Emergency Rollback

If a migration causes critical issues:

1. **Immediately disable RLS** on affected tables:

   ```sql
   ALTER TABLE <table_name> DISABLE ROW LEVEL SECURITY;
   ```

2. **Drop the problematic migration's changes**

3. **Contact Supabase support** if data recovery is needed

## Backup Before Migration

Always backup before applying migrations:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Testing Rollbacks

Test rollback procedures in staging environment:

1. Apply migration to staging
2. Test rollback procedure
3. Verify data integrity
4. Document any issues
