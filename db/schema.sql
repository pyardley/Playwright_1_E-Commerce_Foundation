CREATE TABLE IF NOT EXISTS perf_results (
  id BIGSERIAL PRIMARY KEY,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  suite TEXT,
  project TEXT,
  spec_file TEXT NOT NULL,
  title_path TEXT[] NOT NULL,
  title TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  expected_status TEXT NOT NULL,
  retry INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  worker_index INTEGER,
  git_sha TEXT,
  git_ref TEXT,
  web_vitals JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS perf_results_recorded_at_idx ON perf_results (recorded_at);
CREATE INDEX IF NOT EXISTS perf_results_title_idx ON perf_results (title);
