-- FIX: Manually trigger JWT sync for bursar user
-- This will populate the raw_app_meta_data with complete tenant information

DO $$
DECLARE
    v_bursar_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
    v_tenant_id uuid;
    v_tenant_subdomain text;
    v_tenant_name text;
    v_primary_color text;
    v_subscription_tier text;
    v_sms_balance decimal;
    v_pilot_ends_at timestamp with time zone;
BEGIN
    -- Get profile and tenant info
    SELECT 
        p.tenant_id,
        t.slug,
        t.name,
        t.theme_config->>'primary',
        t.subscription_tier,
        t.sms_balance,
        t.pilot_ends_at
    INTO 
        v_tenant_id,
        v_tenant_subdomain,
        v_tenant_name,
        v_primary_color,
        v_subscription_tier,
        v_sms_balance,
        v_pilot_ends_at
    FROM public.profiles p
    JOIN public.tenants t ON p.tenant_id = t.id
    WHERE p.id = v_bursar_id;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Bursar profile or tenant not found';
    END IF;

    -- Update auth.users with complete JWT claims
    UPDATE auth.users
    SET raw_app_meta_data = 
        jsonb_build_object(
            'provider', 'email',
            'providers', ARRAY['email'],
            'tenantId', v_tenant_id,
            'tenantSubdomain', v_tenant_subdomain,
            'schoolName', v_tenant_name,
            'primaryColor', COALESCE(v_primary_color, '#00F5FF'),
            'subscriptionTier', COALESCE(v_subscription_tier, 'starter'),
            'smsBalance', COALESCE(v_sms_balance, 0),
            'isPilot', (v_subscription_tier = 'pilot'),
            'pilotEndsAt', v_pilot_ends_at,
            'role', 'bursar'
        )
    WHERE id = v_bursar_id;

    RAISE NOTICE 'JWT metadata updated successfully!';
    RAISE NOTICE 'Tenant: % (%)', v_tenant_name, v_tenant_subdomain;
END $$;

-- Verify the update
SELECT 
    id,
    email,
    raw_app_meta_data
FROM auth.users
WHERE email = 'bursar@school1.com';
