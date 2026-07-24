-- Phase 2A Safety Events Migration

CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  risk_score NUMERIC,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_select_policy ON safety_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_insert_policy ON safety_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
