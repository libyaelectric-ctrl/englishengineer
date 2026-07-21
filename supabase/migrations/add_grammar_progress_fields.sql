-- Grammar progress tracking
-- Adds status lifecycle, counters, and timing fields

CREATE TABLE IF NOT EXISTS grammar_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  rule_id text NOT NULL,
  status varchar(20) DEFAULT 'new'
    CHECK (status IN ('new', 'learning', 'learned', 'mastered', 'struggling')),
  fail_count int DEFAULT 0,
  correct_count int DEFAULT 0,
  last_practiced_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, rule_id)
);

CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_status
ON grammar_progress(user_id, status);

CREATE INDEX IF NOT EXISTS idx_grammar_progress_struggling
ON grammar_progress(user_id, status)
WHERE status = 'struggling';
