-- Vocabulary progress status tracking
-- Adds status lifecycle, fail/correct counters, and timing fields

ALTER TABLE vocabulary_progress
  ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'new'
    CHECK (status IN ('new', 'learning', 'learned', 'mastered', 'struggling')),
  ADD COLUMN IF NOT EXISTS fail_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_practiced_at timestamptz,
  ADD COLUMN IF NOT EXISTS mastered_at timestamptz;

-- Index for fast status-based queries
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_status
ON vocabulary_progress(status);

-- Index for struggling words lookup
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_struggling
ON vocabulary_progress(user_id, status)
WHERE status = 'struggling';
