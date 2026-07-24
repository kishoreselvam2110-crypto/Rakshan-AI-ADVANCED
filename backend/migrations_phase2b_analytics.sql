-- Phase 2B Analytics and Safety Enhancements Migration

-- 1. Extend tourist_scam_checks table
ALTER TABLE tourist_scam_checks
  ADD COLUMN IF NOT EXISTS scam_type TEXT,
  ADD COLUMN IF NOT EXISTS tourist_category TEXT,
  ADD COLUMN IF NOT EXISTS destination TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;

-- 2. Create Guardian Alerts Log Table (Optional but good for tracking)
CREATE TABLE IF NOT EXISTS guardian_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for guardian alerts
ALTER TABLE guardian_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY guardian_user_select ON guardian_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY guardian_user_insert ON guardian_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: In a production environment, we would also create an "admin" role 
-- or a specific RLS policy for the Admin Dashboard to bypass the `auth.uid() = user_id` 
-- restriction and read global analytics. We simulate global access for the /admin APIs.
