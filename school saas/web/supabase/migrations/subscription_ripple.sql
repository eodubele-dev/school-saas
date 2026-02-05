-- Migration: Subscription Tier Ripple Effect
-- Ensures JWTs are updated for all users when a school changes tiers.

-- 1. Create the Ripple Function
CREATE OR REPLACE FUNCTION public.ripple_tenant_tier_change()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    -- Only act if the subscription_tier has actually changed
    IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
        -- Touch all profiles linked to this tenant to trigger public.sync_user_jwt_claims()
        UPDATE public.profiles
        SET updated_at = NOW()
        WHERE tenant_id = NEW.id;
        
        -- (Optional) Add a system notification for the change? 
        -- Already handled by audit logs but this is the "engine" part.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_tenant_tier_change ON public.tenants;

CREATE TRIGGER on_tenant_tier_change
AFTER UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.ripple_tenant_tier_change();

-- 3. Comment for clarity
COMMENT ON FUNCTION public.ripple_tenant_tier_change() IS 'Propagates tenant tier changes to all users to force a JWT payload refresh.';
