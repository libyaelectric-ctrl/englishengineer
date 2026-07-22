-- Reading content and progress tracking

CREATE TABLE IF NOT EXISTS reading_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  level varchar(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  content_text text NOT NULL,
  word_count int DEFAULT 0,
  questions jsonb DEFAULT '[]',
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reading_content_level ON reading_content(level);
CREATE INDEX IF NOT EXISTS idx_reading_content_category ON reading_content(category);

CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  content_id uuid REFERENCES reading_content(id),
  status varchar(20) DEFAULT 'new' CHECK (status IN ('new','read','completed')),
  score int DEFAULT 0,
  last_read_at timestamptz,
  times_read int DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user_status
ON reading_progress(user_id, status);
