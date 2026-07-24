-- SQL Migration Script for Rakshan AI (SHIELD AI)
-- Add support for Scam Checks, Connectivity Logs, and Lost Item Reports

-- 1. Tourist Scam Checks Table
CREATE TABLE IF NOT EXISTS tourist_scam_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  query TEXT NOT NULL,
  risk_score INT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT NOT NULL,
  analysis TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tourist_scam_checks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public select for checks" ON tourist_scam_checks;
DROP POLICY IF EXISTS "Allow public insert for checks" ON tourist_scam_checks;

-- Policies
CREATE POLICY "Allow public select for checks" ON tourist_scam_checks FOR SELECT USING (true);
CREATE POLICY "Allow public insert for checks" ON tourist_scam_checks FOR INSERT WITH CHECK (true);


-- 2. Connectivity Logs Table
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

-- Policies
CREATE POLICY "Allow public select for logs" ON connectivity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert for logs" ON connectivity_logs FOR INSERT WITH CHECK (true);


-- 3. Lost Item Reports Table
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

-- Policies
CREATE POLICY "Allow public select for reports" ON lost_item_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert for reports" ON lost_item_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for reports" ON lost_item_reports FOR UPDATE USING (true);


-- Note on Supabase Storage Bucket:
-- Make sure to create a public storage bucket named "lost-item-docs" in your Supabase console,
-- and enable public access/policies for upload and download.
