-- ─────────────────────────────────────────
-- 001_initial_schema.sql
-- AI Secretary — 初期スキーマ
-- ─────────────────────────────────────────

-- updated_at 自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── tasks ───────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,                          -- 将来の認証用（現在はNULL許容）
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('high', 'medium', 'low')),
  due_date    TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS tasks_user_id_due_date_idx ON tasks (user_id, due_date);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);

-- RLS（将来の認証用に有効化するが、現在は anon が全操作可能）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_tasks" ON tasks
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_own_tasks" ON tasks
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ─── documents ───────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID,
  type              TEXT NOT NULL
                    CHECK (type IN ('proofread', 'minutes', 'research')),
  title             TEXT NOT NULL,
  original_content  TEXT,
  processed_content TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_type_idx ON documents (user_id, type);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_documents" ON documents
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_own_documents" ON documents
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ─── writing_styles ──────────────────────
CREATE TABLE IF NOT EXISTS writing_styles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE,
  style_patterns JSONB DEFAULT '{}',
  sample_count   INTEGER DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE writing_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_writing_styles" ON writing_styles
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_own_writing_styles" ON writing_styles
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
