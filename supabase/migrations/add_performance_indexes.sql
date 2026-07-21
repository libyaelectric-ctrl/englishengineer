-- Performance indexes for EngineerOS
-- Generated from docs/DATABASE_INDEXES.md

-- High Priority: Query Performance

-- Vocabulary progress by user and status
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user_status
ON vocabulary_progress(user_id, status, next_review_at);

-- Subscriptions by user and status (partial index)
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

-- Medium Priority: Analytics

-- Audit logs by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action, created_at DESC);

-- Subscriptions by plan (partial index)
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan
ON subscriptions(plan_id)
WHERE status = 'active';

-- Vocabulary by word (for lookups)
CREATE INDEX IF NOT EXISTS idx_vocabulary_word
ON vocabulary_progress(word);
