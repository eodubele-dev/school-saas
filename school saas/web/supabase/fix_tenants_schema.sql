-- FIX: Add settings column and missing branding columns to tenants
-- Run this in Supabase SQL Editor to resolve the 'settings' column not found error.

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS address text;

-- Verify existence (optional)
COMMENT ON COLUMN public.tenants.settings IS 'Global school settings including Kiosk Master PIN and notification preferences.';
