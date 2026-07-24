-- SQL Migration Script for Rakshan AI (SHIELD AI) - Phase 2A
-- Add support for safety_events table

-- 1. Safety Events Table
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL, -- e.g., 'Scam Alert', 'Connectivity Alert', etc.
  event_source TEXT NOT NULL, -- e.g., 'Scam Detection', 'SOS System', etc.
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

-- Policies
CREATE POLICY "Allow public select for events" ON safety_events FOR SELECT USING (true);
-- 2. Safety Score History Table
CREATE TABLE IF NOT EXISTS safety_score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  score INT CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL, -- LOW, MEDIUM, HIGH
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for safety_score_history
ALTER TABLE safety_score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for score" ON safety_score_history;
DROP POLICY IF EXISTS "Allow public insert for score" ON safety_score_history;

CREATE POLICY "Allow public select for score" ON safety_score_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert for score" ON safety_score_history FOR INSERT WITH CHECK (true);
