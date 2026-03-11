-- Migration: Add settings column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonB;

-- Comment for clarity
COMMENT ON COLUMN public.tenants.settings IS 'General tenant settings including signatures, branding overrides, etc.';
