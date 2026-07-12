# Database Performance Analysis

## Overview

This document analyzes database performance, identifies bottlenecks, and recommends optimizations for EngineerOS.

## Current Database Statistics

### Table Sizes (Estimated)

| Table               | Estimated Rows | Last Analyzed |
| ------------------- | -------------- | ------------- |
| workspaces          | ~1,000         | TBD           |
| subscriptions       | ~500           | TBD           |
| audit_logs          | ~10,000        | TBD           |
| vocabulary_progress | ~50,000        | TBD           |
| ai_conversations    | ~25,000        | TBD           |

### Index Usage Analysis

Run these queries to identify unused or missing indexes:

```sql
-- Find unused indexes
SELECT
  schemaname || '.' || tablename AS table,
  indexrelname AS index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
  idx_scan AS times_used
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE idx_scan = 0
  AND NOT i.indisunique
  AND NOT i.indisprimary
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Find missing indexes (sequential scans on large tables)
SELECT
  schemaname || '.' || relname AS table,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC;
```

## Query Performance

### High-Priority Queries

#### 1. Vocabulary Progress Lookup

```sql
-- Current query (optimize)
SELECT * FROM vocabulary_progress
WHERE user_id = $1
  AND status = 'due_today'
ORDER BY next_review_at;

-- Recommended index
CREATE INDEX idx_vocabulary_progress_user_status
ON vocabulary_progress(user_id, status, next_review_at);
```

#### 2. Subscription Status Check

```sql
-- Current query
SELECT * FROM subscriptions
WHERE user_id = $1
  AND status = 'active';

-- Recommended index
CREATE INDEX idx_subscriptions_user_status
ON subscriptions(user_id, status)
WHERE status = 'active';
```

#### 3. Audit Log Query

```sql
-- Current query
SELECT * FROM audit_logs
WHERE user_id = $1
  AND created_at > $2
ORDER BY created_at DESC;

-- Recommended index
CREATE INDEX idx_audit_logs_user_time
ON audit_logs(user_id, created_at DESC);
```

### EXPLAIN ANALYZE Results

Run these in Supabase SQL Editor:

```sql
-- Vocabulary progress query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM vocabulary_progress
WHERE user_id = 'test-user'
  AND status = 'due_today';

-- Subscription check
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM subscriptions
WHERE user_id = 'test-user'
  AND status = 'active';

-- Audit log query
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM audit_logs
WHERE user_id = 'test-user'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

## Recommended Indexes

### High Priority

```sql
-- Vocabulary progress optimization
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user_status
ON vocabulary_progress(user_id, status, next_review_at);

-- Subscription lookup optimization
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status)
WHERE status = 'active';

-- Audit log time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time
ON audit_logs(user_id, created_at DESC);
```

### Medium Priority

```sql
-- Workspace lookup by user
CREATE INDEX IF NOT EXISTS idx_workspaces_user
ON workspaces(user_id);

-- AI conversations by user and date
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date
ON ai_conversations(user_id, created_at DESC);
```

### Low Priority

```sql
-- Audit logs by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action, created_at DESC);
```

## Connection Pooling

### Current Configuration

- **Provider:** Supabase (PgBouncer)
- **Pool Mode:** Transaction
- **Max Connections:** Depends on plan

### Recommendations

1. **Use connection pooling** for all database connections
2. **Prefer server-side connections** over client-side
3. **Monitor connection usage** in Supabase Dashboard

### Supabase Pooler Configuration

```
Host: aws-0-[region].pooler.supabase.com
Port: 6543 (transaction mode) or 5432 (session mode)
```

**Best Practices:**

- Use port 6543 (transaction mode) for serverless functions
- Use port 5432 (session mode) for long-lived connections
- Enable `pgbouncer` in Supabase settings

## Performance Monitoring

### Key Metrics

| Metric                | Target         | Current |
| --------------------- | -------------- | ------- |
| Query response time   | < 100ms        | TBD     |
| Connection count      | < 80% of limit | TBD     |
| Cache hit ratio       | > 99%          | TBD     |
| Sequential scan ratio | < 5%           | TBD     |

### Monitoring Queries

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Cache hit ratio
SELECT
  sum(blks_hit) / (sum(blks_hit) + sum(blks_read)) AS cache_hit_ratio
FROM pg_stat_database;

-- Slow queries (if pg_stat_statements enabled)
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Optimization Checklist

- [ ] Run EXPLAIN ANALYZE on critical queries
- [ ] Create recommended indexes
- [ ] Monitor query performance for 1 week
- [ ] Review and optimize slow queries
- [ ] Verify connection pooling configuration
- [ ] Set up performance monitoring alerts
- [ ] Document baseline metrics

## Last Analysis

- **Date:** TBD
- **Analyst:** TBD
- **Findings:** Pending
