CREATE TABLE IF NOT EXISTS content_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  pool_ratio DECIMAL(5,4),
  target_ratio DECIMAL(5,4) DEFAULT 0.75,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE content_generation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own logs" ON content_generation_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON content_generation_log FOR INSERT WITH CHECK (auth.uid() = user_id);