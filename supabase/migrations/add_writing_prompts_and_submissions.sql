-- Writing prompts and submissions

CREATE TABLE IF NOT EXISTS writing_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  level varchar(5) NOT NULL CHECK (level IN ('A1','A2','B1','B2','C1','C2')),
  description text NOT NULL,
  word_target int DEFAULT 150,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writing_prompts_level ON writing_prompts(level);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_category ON writing_prompts(category);

CREATE TABLE IF NOT EXISTS writing_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  prompt_id uuid REFERENCES writing_prompts(id),
  content text NOT NULL,
  score int DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  grammar_score int DEFAULT 0,
  vocabulary_score int DEFAULT 0,
  coherence_score int DEFAULT 0,
  structure_score int DEFAULT 0,
  feedback jsonb DEFAULT '{}',
  status varchar(20) DEFAULT 'draft' CHECK (status IN ('draft','submitted','graded')),
  submitted_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_status
ON writing_submissions(user_id, status);
