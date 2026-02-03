
DO $$
DECLARE
    v_tenant_id uuid;
    v_user_id uuid;
BEGIN
    -- 1. Get the Tenant ID for 'school1'
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'school1' LIMIT 1;

    -- If no tenant, create one (fallback)
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, slug, domain, plan)
        VALUES ('Achievers School', 'school1', 'school1.eduflow.ng', 'premium')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- 2. Get the User ID for 'teacher@school1.com'
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'teacher@school1.com';

    -- If user exists, fix their profile
    IF v_user_id IS NOT NULL THEN
        -- UPSERT (Insert or Update if exists) 
        -- Removed 'email' and 'avatar_url' as they do not exist
        INSERT INTO profiles (id, full_name, role, tenant_id)
        VALUES (
            v_user_id, 
            'Sarah Teacher', 
            'teacher', 
            v_tenant_id
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'teacher',
            tenant_id = v_tenant_id,
            full_name = 'Sarah Teacher';

        -- Update auth metadata as well to match
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_build_object(
            'full_name', 'Sarah Teacher',
            'role', 'teacher',
            'school_slug', 'school1'
        )
        WHERE id = v_user_id;

        RAISE NOTICE '✅ FIXED: Updated profile for teacher@school1.com (ID: %)', v_user_id;
    ELSE
        RAISE NOTICE '❌ ERROR: User teacher@school1.com not found in auth.users. Please sign up first.';
    END IF;
END $$;
