-- Performance indexes for EngineerOS
-- Fixed: uses correct table names (subscription_status, ai_sessions, vocabulary_reviews)

-- Vocabulary reviews by user and review time
CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_user_reviewed
ON public.vocabulary_reviews(user_id, reviewed_at DESC);

-- Subscription status by user and status (partial index)
CREATE INDEX IF NOT EXISTS idx_subscription_status_user_status
ON public.subscription_status(user_id, status)
WHERE status = 'active';

-- Audit logs by user and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time
ON public.audit_logs(user_id, created_at DESC);

-- Workspaces by user
CREATE INDEX IF NOT EXISTS idx_workspaces_user
ON public.workspaces(user_id);

-- AI sessions by user and date
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_date
ON public.ai_sessions(user_id, created_at DESC);

-- Medium Priority: Analytics

-- Audit logs by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON public.audit_logs(action, created_at DESC);

-- Subscription status by plan (partial index)
CREATE INDEX IF NOT EXISTS idx_subscription_status_plan
ON public.subscription_status(plan_id)
WHERE status = 'active';

-- Vocabulary reviews by vocabulary_id (for lookups)
CREATE INDEX IF NOT EXISTS idx_vocabulary_reviews_vocabulary_id
ON public.vocabulary_reviews(vocabulary_id);
