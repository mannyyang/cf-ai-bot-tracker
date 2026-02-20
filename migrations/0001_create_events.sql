CREATE TABLE IF NOT EXISTS ai_bot_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  host TEXT,
  path TEXT NOT NULL,
  source TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('click', 'crawler', 'agent')),
  ip TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  user_agent TEXT,
  referer TEXT,
  request_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_host ON ai_bot_events(host);
CREATE INDEX IF NOT EXISTS idx_source ON ai_bot_events(source);
CREATE INDEX IF NOT EXISTS idx_type ON ai_bot_events(type);
CREATE INDEX IF NOT EXISTS idx_created_at ON ai_bot_events(created_at);
CREATE INDEX IF NOT EXISTS idx_country ON ai_bot_events(country);
