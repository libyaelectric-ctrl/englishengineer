# Database Index Strategy

## Recommended Indexes

### High Priority (Query Performance)

```sql
-- Vocabulary progress by user and status
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user_status
ON vocabulary_progress(user_id, status, next_review_at);

-- Subscriptions by user and status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status)
WHERE status = 'active';

-- Audit logs by user and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time
ON audit_logs(user_id, created_at DESC);

-- Workspaces by user
CREATE INDEX IF NOT EXISTS idx_workspaces_user
ON workspaces(user_id);

-- AI conversations by user and date
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date
ON ai_conversations(user_id, created_at DESC);
```

### Medium Priority (Analytics)

```sql
-- Audit logs by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action, created_at DESC);

-- Subscriptions by plan
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
ON subscriptions(plan_id)
WHERE status = 'active';

-- Vocabulary by word (for lookups)
CREATE INDEX IF NOT EXISTS idx_vocabulary_word
ON vocabulary_progress(word);
```

## Index Usage Monitoring

```sql
-- Find unused indexes
SELECT
  schemaname || '.' || tablename AS table_name,
  indexrelname AS index_name,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
  idx_scan AS times_used
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE idx_scan = 0
  AND NOT i.indisunique
  AND NOT i.indisprimary
ORDER BY pg_relation_size(i.indexrelid) DESC;

-- Find missing indexes (sequential scans)
SELECT
  schemaname || '.' || relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC;
```

## Performance Impact

| Query                | Before Index | After Index |
| -------------------- | ------------ | ----------- |
| Vocabulary by user   | ~50ms        | ~5ms        |
| Subscriptions lookup | ~30ms        | ~3ms        |
| Audit log query      | ~100ms       | ~10ms       |

## Last Updated

- **Date:** 2026-07-12
