-- ─────────────────────────────────────────
-- 002_calendar_schema.sql
-- AI Secretary — カレンダー連携スキーマ
-- ─────────────────────────────────────────

-- ─── calendar_tokens ─────────────────────
CREATE TABLE IF NOT EXISTS calendar_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date   BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER calendar_tokens_updated_at
  BEFORE UPDATE ON calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE calendar_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own tokens" ON calendar_tokens
  FOR ALL USING (auth.uid() = user_id);

-- ─── calendar_events ─────────────────────
CREATE TABLE IF NOT EXISTS calendar_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  google_event_id TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  location        TEXT,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  is_all_day      BOOLEAN NOT NULL DEFAULT FALSE,
  task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
  color           TEXT,
  source          TEXT NOT NULL DEFAULT 'local'
                  CHECK (source IN ('google', 'local')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS calendar_events_user_id_start_idx ON calendar_events (user_id, start_time);
CREATE INDEX IF NOT EXISTS calendar_events_google_event_id_idx ON calendar_events (google_event_id);
CREATE INDEX IF NOT EXISTS calendar_events_task_id_idx ON calendar_events (task_id);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own events" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);
