-- UPDATING TENANTS TABLE FOR BRANDING
-- Run this in your Supabase SQL Editor

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS address text;

-- Create school-assets bucket if it doesn't exist (via RPC or manual check)
-- Note: Supabase buckets are usually managed via the dashboard, 
-- but we can ensure policies exist if we were creating it.
