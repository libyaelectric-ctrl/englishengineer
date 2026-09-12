-- Endpoint-level aggregated metrics (replaces api-metrics.ts in-memory Map)
CREATE TABLE IF NOT EXISTS api_endpoint_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL,
  method text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  total_duration_ms bigint NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(endpoint, method)
);

-- Request-level raw metrics for performance monitoring (replaces performance-monitor.ts in-memory state)
CREATE TABLE IF NOT EXISTS performance_request_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  method text,
  path text,
  duration_ms bigint NOT NULL,
  is_error boolean NOT NULL DEFAULT false,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Rate limit event log
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scope text NOT NULL,
  blocked boolean NOT NULL DEFAULT false,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_api_endpoint_metrics_endpoint ON api_endpoint_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_request_metrics_recorded ON performance_request_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_request_metrics_path ON performance_request_metrics(method, path);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_recorded ON rate_limit_events(recorded_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_events_scope ON rate_limit_events(scope);

-- Auto-prune old performance data (keep 7 days)
CREATE OR REPLACE FUNCTION prune_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_request_metrics WHERE recorded_at < now() - interval '7 days';
  DELETE FROM rate_limit_events WHERE recorded_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- RLS: only service role can access (admin/metrics endpoints use service role)
ALTER TABLE api_endpoint_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_request_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON api_endpoint_metrics FOR ALL USING (false);
CREATE POLICY "Service role only" ON performance_request_metrics FOR ALL USING (false);
CREATE POLICY "Service role only" ON rate_limit_events FOR ALL USING (false);
