-- Knowledge Pool: Kalıcı kelime/kural havuzu
-- Kullanıcı mastered kelimelerini Supabase'de saklar

CREATE TABLE IF NOT EXISTS knowledge_pool_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content_type TEXT CHECK (content_type IN ('vocabulary', 'grammar')) NOT NULL,
  content_id TEXT NOT NULL,
  mastered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_pool_user ON knowledge_pool_entries(user_id, content_type);

-- RLS: Kullanıcı sadece kendi satırlarını okuyabilir/yazabilir/silebilir
ALTER TABLE knowledge_pool_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own pool entries"
  ON knowledge_pool_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pool entries"
  ON knowledge_pool_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pool entries"
  ON knowledge_pool_entries
  FOR DELETE
  USING (auth.uid() = user_id);
