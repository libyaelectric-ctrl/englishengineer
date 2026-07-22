-- Speaking prompts and submissions

CREATE TABLE IF NOT EXISTS speaking_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  level varchar(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  description text NOT NULL,
  target_duration int DEFAULT 60,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_prompts_level ON speaking_prompts(level);

CREATE TABLE IF NOT EXISTS speaking_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  prompt_id uuid REFERENCES speaking_prompts(id),
  audio_url text,
  transcript text,
  pronunciation_score int DEFAULT 0,
  fluency_score int DEFAULT 0,
  grammar_score int DEFAULT 0,
  vocabulary_score int DEFAULT 0,
  overall_score int DEFAULT 0,
  feedback jsonb DEFAULT '{}',
  status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','graded')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_speaking_submissions_user_status
ON speaking_submissions(user_id, status);
