-- master_schema.sql: Combined Database Setup Script for Rakshan AI
-- Execute this script in the Supabase SQL Editor (https://supabase.com) for project: https://jnhzfzrwchbcheozdqfh.supabase.co

-- Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. tourists: Verified Digital ID Registry
-- ==========================================
CREATE TABLE IF NOT EXISTS tourists (
  id TEXT PRIMARY KEY, -- SAVIOUR-XXXXXXXX
  name TEXT NOT NULL,
  passport TEXT NOT NULL,
  destination TEXT NOT NULL,
  "emergencyContact" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tourists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for tourists" ON tourists;
DROP POLICY IF EXISTS "Allow public insert for tourists" ON tourists;

CREATE POLICY "Allow public select for tourists" ON tourists FOR SELECT USING (true);
CREATE POLICY "Allow public insert for tourists" ON tourists FOR INSERT WITH CHECK (true);


-- ==========================================
-- 2. itineraries: Cached Travel Plans
-- ==========================================
CREATE TABLE IF NOT EXISTS itineraries (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for itineraries" ON itineraries;
DROP POLICY IF EXISTS "Allow public insert for itineraries" ON itineraries;

CREATE POLICY "Allow public select for itineraries" ON itineraries FOR SELECT USING (true);
CREATE POLICY "Allow public insert for itineraries" ON itineraries FOR INSERT WITH CHECK (true);


-- ==========================================
-- 3. zones: Danger Zones / Restricted Perimeters
-- ==========================================
CREATE TABLE IF NOT EXISTS zones (
  name TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  radius DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Sample Danger Zones
INSERT INTO zones (name, lat, lon, radius, type)
VALUES 
  ('Deep Forest Restricted Zone', 12.9200, 79.1325, 3000, 'FOREST'),
  ('Hazardous Cave System', 11.9416, 79.8083, 1000, 'CAVE')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for zones" ON zones;

CREATE POLICY "Allow public select for zones" ON zones FOR SELECT USING (true);


-- ==========================================
-- 4. tourist_scam_checks: Scam Telemetry & ML Audits
-- ==========================================
CREATE TABLE IF NOT EXISTS tourist_scam_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  query TEXT NOT NULL,
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL,
  analysis TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  scam_type TEXT,
  tourist_category TEXT,
  destination TEXT,
  severity TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tourist_scam_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for checks" ON tourist_scam_checks;
DROP POLICY IF EXISTS "Allow public insert for checks" ON tourist_scam_checks;

CREATE POLICY "Allow public select for checks" ON tourist_scam_checks FOR SELECT USING (true);
CREATE POLICY "Allow public insert for checks" ON tourist_scam_checks FOR INSERT WITH CHECK (true);


-- ==========================================
-- 5. connectivity_logs: Telemetry Signal Mapping
-- ==========================================
CREATE TABLE IF NOT EXISTS connectivity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  network_type TEXT NOT NULL,
  signal_quality INT NOT NULL CHECK (signal_quality >= 0 AND signal_quality <= 100),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE connectivity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for logs" ON connectivity_logs;
DROP POLICY IF EXISTS "Allow public insert for logs" ON connectivity_logs;

CREATE POLICY "Allow public select for logs" ON connectivity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert for logs" ON connectivity_logs FOR INSERT WITH CHECK (true);


-- ==========================================
-- 6. lost_item_reports: E-FIR Sashes & Lost Docs
-- ==========================================
CREATE TABLE IF NOT EXISTS lost_item_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  item_type TEXT NOT NULL,
  report_status TEXT NOT NULL DEFAULT 'PENDING',
  last_step_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE lost_item_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for reports" ON lost_item_reports;
DROP POLICY IF EXISTS "Allow public insert for reports" ON lost_item_reports;
DROP POLICY IF EXISTS "Allow public update for reports" ON lost_item_reports;

CREATE POLICY "Allow public select for reports" ON lost_item_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert for reports" ON lost_item_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for reports" ON lost_item_reports FOR UPDATE USING (true);


-- ==========================================
-- 7. safety_events: Telemetry SOS Signals & Incidents
-- ==========================================
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  risk_score INT CHECK (risk_score >= 0 AND risk_score <= 100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for events" ON safety_events;
DROP POLICY IF EXISTS "Allow public insert for events" ON safety_events;

CREATE POLICY "Allow public select for events" ON safety_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert for events" ON safety_events FOR INSERT WITH CHECK (true);


-- ==========================================
-- 8. safety_score_history: Periodic Safety Audits
-- ==========================================
CREATE TABLE IF NOT EXISTS safety_score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  score INT CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE safety_score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for score" ON safety_score_history;
DROP POLICY IF EXISTS "Allow public insert for score" ON safety_score_history;

CREATE POLICY "Allow public select for score" ON safety_score_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert for score" ON safety_score_history FOR INSERT WITH CHECK (true);


-- ==========================================
-- 9. guardian_alerts: SOS Notifications
-- ==========================================
CREATE TABLE IF NOT EXISTS guardian_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE guardian_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for guardian" ON guardian_alerts;
DROP POLICY IF EXISTS "Allow public insert for guardian" ON guardian_alerts;

CREATE POLICY "Allow public select for guardian" ON guardian_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert for guardian" ON guardian_alerts FOR INSERT WITH CHECK (true);
