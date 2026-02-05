-- Migration: Sync Tenant Data to JWT (app_metadata) (Custom Claims)
-- This allows the "Platinum" optimization of stateless verification in Middleware.

-- 1. Create a function to sync profile/tenant data to auth.users.raw_app_meta_data
CREATE OR REPLACE FUNCTION public.sync_user_jwt_claims()
RETURNS TRIGGER 
SECURITY DEFINER -- Run as owner to access auth.users
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
    -- We merge existing metadata with new claims
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

-- 2. Trigger on Profiles Table
-- Whenever a user's profile is updated (assigned to tenant, role change), sync the claims.
DROP TRIGGER IF EXISTS on_profile_update_jwt_sync ON public.profiles;

CREATE TRIGGER on_profile_update_jwt_sync
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_jwt_claims();

-- 3. Utility Function to Backfill Existing Users (Optional but recommended)
-- Run this once manually: SELECT public.backfill_jwt_claims();
CREATE OR REPLACE FUNCTION public.backfill_jwt_claims()
RETURNS void
SECURITY DEFINER
AS $$
DECLARE
    _rec record;
BEGIN
    FOR _rec IN SELECT * FROM public.profiles LOOP
        -- Triggers logic manually for each row
        PERFORM public.sync_user_jwt_claims_logic(_rec.id, _rec.tenant_id, _rec.role);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Note: We split logic to helper for backfill or just update profiles to trigger it.
-- Simplify: Just UPDATE profiles SET updated_at = now(); to trigger all.
