-- SQL script to programmatically create the 'lost-item-docs' storage bucket and enable public access
-- Copy and run this in your Supabase SQL Editor (https://supabase.com)

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lost-item-docs', 'lost-item-docs', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to all files inside 'lost-item-docs' bucket (Select, Insert, Update, Delete)
DROP POLICY IF EXISTS "Public Access for lost-item-docs" ON storage.objects;

CREATE POLICY "Public Access for lost-item-docs"
ON storage.objects FOR ALL
USING ( bucket_id = 'lost-item-docs' )
WITH CHECK ( bucket_id = 'lost-item-docs' );
