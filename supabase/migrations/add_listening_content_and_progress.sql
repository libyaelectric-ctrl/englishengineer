-- Listening content and progress tracking

CREATE TABLE IF NOT EXISTS listening_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  level varchar(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  audio_url text,
  transcript text NOT NULL,
  questions jsonb DEFAULT '[]',
  category text DEFAULT 'general',
  duration int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listening_content_level ON listening_content(level);

CREATE TABLE IF NOT EXISTS listening_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  content_id uuid REFERENCES listening_content(id),
  status varchar(20) DEFAULT 'new' CHECK (status IN ('new','listened','completed')),
  score int DEFAULT 0,
  times_listened int DEFAULT 0,
  last_listened_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_listening_progress_user_status
ON listening_progress(user_id, status);
