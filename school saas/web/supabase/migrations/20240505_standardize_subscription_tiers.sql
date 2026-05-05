-- Migration: Standardize Subscription Tiers
-- Standardizes on 'subscription_tier' column with lowercase IDs: pilot, starter, professional, platinum

-- 1. Ensure the correct column exists and is used
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'starter';

-- 2. Migrate data from 'tier' column if it exists and 'subscription_tier' is default
-- (Mapping: Free -> pilot, Standard -> starter, Premium -> professional, Platinum -> platinum)
UPDATE public.tenants 
SET subscription_tier = LOWER(CASE 
    WHEN tier = 'Free' THEN 'pilot'
    WHEN tier = 'Standard' THEN 'starter'
    WHEN tier = 'Premium' THEN 'professional'
    WHEN tier = 'Platinum' THEN 'platinum'
    ELSE COALESCE(subscription_tier, 'starter')
END)
WHERE subscription_tier = 'starter' OR subscription_tier IS NULL;

-- 3. Update the JWT Sync function to use the correct standardized values
CREATE OR REPLACE FUNCTION public.sync_user_jwt_claims()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
    _tenant_subdomain text;
    _tenant_name text;
    _primary_color text;
    _subscription_tier text;
    _sms_balance decimal;
    _pilot_ends_at timestamp with time zone;
    _role text;
BEGIN
    -- Get Tenant Details
    SELECT slug, name, theme_config->>'primary', subscription_tier, sms_balance, pilot_ends_at
    INTO _tenant_subdomain, _tenant_name, _primary_color, _subscription_tier, _sms_balance, _pilot_ends_at
    FROM public.tenants
    WHERE id = NEW.tenant_id;

    -- Get Role
    _role := NEW.role;

    -- Update auth.users
    UPDATE auth.users
    SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object(
            'tenantId', NEW.tenant_id,
            'tenantSubdomain', _tenant_subdomain,
            'schoolName', _tenant_name,
            'primaryColor', COALESCE(_primary_color, '#00F5FF'),
            'subscriptionTier', COALESCE(_subscription_tier, 'starter'),
            'smsBalance', COALESCE(_sms_balance, 0),
            'isPilot', (_subscription_tier = 'pilot'),
            'pilotEndsAt', _pilot_ends_at,
            'role', _role
        )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Force a refresh of all users' JWTs by touching the profiles table
-- This ensures the new 'subscriptionTier' claim is available immediately.
UPDATE public.profiles SET updated_at = NOW();
