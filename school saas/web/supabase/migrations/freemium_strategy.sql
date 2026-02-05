-- Migration: Lagos Freemium Strategy (Pilot Tier)
-- 1. Add SMS Balance and Pilot Expiry tracking to Tenants
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS sms_balance DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS pilot_ends_at TIMESTAMP WITH TIME ZONE;

-- 2. Index for expiry tracking
CREATE INDEX IF NOT EXISTS idx_tenants_pilot_expiry ON public.tenants(pilot_ends_at) WHERE pilot_ends_at IS NOT NULL;

-- 3. Update JWT Sync function to include sms_balance and pilot status
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
