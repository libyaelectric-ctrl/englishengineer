# Backup Policy

## Overview

EngineerOS uses Supabase (PostgreSQL) as the primary database. This document defines the backup strategy, retention policies, and recovery procedures.

## Supabase Built-in Backups

Supabase provides automatic backups:

| Plan | Backup Frequency      | Retention      |
| ---- | --------------------- | -------------- |
| Free | Daily                 | 7 days         |
| Pro  | Daily + Point-in-time | 7 days + PITR  |
| Team | Daily + Point-in-time | 14 days + PITR |

**Current Plan:** Pro (recommended for production)

### What Supabase Backs Up Automatically

- All database tables
- Row Level Security (RLS) policies
- Database roles and permissions
- Extensions and functions

### What Supabase Does NOT Back Up

- Storage files (separate backup needed)
- Edge Functions (deploy from source)
- Auth users (stored in database, included)

## Manual Backup Procedures

### Database Export (pg_dump)

```bash
# Full database dump
pg_dump "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  --format=custom \
  --verbose \
  --file="backup_$(date +%Y%m%d_%H%M%S).dump"

# Schema only
pg_dump "postgresql://..." \
  --schema-only \
  --file="schema_$(date +%Y%m%d).sql"

# Data only (specific tables)
pg_dump "postgresql://..." \
  --data-only \
  --table=public.workspaces \
  --table=public.subscriptions \
  --file="data_$(date +%Y%m%d).sql"
```

### Storage Backup

```bash
# List storage buckets
supabase storage list

# Download specific bucket
supabase storage download --bucket-name avatars --local-path ./backups/avatars
```

## Backup Schedule

| Type                 | Frequency | Retention | Method    |
| -------------------- | --------- | --------- | --------- |
| Automated (Supabase) | Daily     | 7-14 days | Automatic |
| Manual pg_dump       | Weekly    | 30 days   | Script    |
| Pre-deploy snapshot  | On deploy | 7 days    | CI/CD     |
| Storage files        | Weekly    | 30 days   | Script    |

## Backup Storage Location

- **Primary:** Supabase automatic backups
- **Secondary:** Encrypted cloud storage (Google Drive / S3)
- **Local:** Development machines (temporary)

## Restore Procedures

### Point-in-time Recovery (PITR)

Available on Pro plan:

1. Go to Supabase Dashboard → Database → Backups
2. Select "Point in Time Recovery"
3. Choose restore point (timestamp)
4. Confirm restore

**Note:** PITR creates a new database. Update connection strings after restore.

### Full Restore from pg_dump

```bash
# Restore full backup
pg_restore "postgresql://..." \
  --verbose \
  --clean \
  --if-exists \
  "backup_20260710_120000.dump"

# Restore specific table
pg_restore "postgresql://..." \
  --verbose \
  --data-only \
  --table=public.workspaces \
  "backup_20260710_120000.dump"
```

### Schema-only Restore

```bash
psql "postgresql://..." -f schema_20260710.sql
```

## Testing Backups

Backup testing is performed quarterly:

1. **Restore to staging** — Full restore to staging environment
2. **Data integrity check** — Verify row counts, constraints
3. **Application connectivity** — Test all API endpoints
4. **Document results** — Update this file with test date and outcome

### Last Backup Test

- **Date:** TBD (schedule quarterly)
- **Result:** Pending
- **Notes:** N/A

## Disaster Recovery

See [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) for detailed recovery procedures.

## Compliance

- Backups are encrypted at rest (Supabase default)
- Backup access is restricted to admin roles
- Backup logs are retained for audit purposes
- KVKK/GDPR: User data in backups follows same retention policy

## Monitoring

- Supabase Dashboard → Database → Backups
- Check backup status weekly
- Set up alerts for failed backups (if available)
