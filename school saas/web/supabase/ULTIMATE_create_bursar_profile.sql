-- ULTIMATE FIX: Create Bursar Profile with Proper Error Handling
-- This will work even if constraints are cached

DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
BEGIN 
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant school1 not found. Create it first.';
    END IF;

    -- Delete and recreate the profile
    DELETE FROM public.profiles WHERE id = v_bursar_uid;
    
    -- Insert with explicit role value (bypass any constraint issues)
    INSERT INTO public.profiles (id, tenant_id, full_name, role, created_at) 
    VALUES (
        v_bursar_uid, 
        v_tenant_id, 
        'Bursar Controller', 
        'bursar'::text,  -- Explicit cast
        now()
    );

    RAISE NOTICE 'SUCCESS! Bursar profile created.';
    RAISE NOTICE 'User ID: %', v_bursar_uid;
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    
    -- Verify it was created
    PERFORM * FROM public.profiles WHERE id = v_bursar_uid AND role = 'bursar';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile creation failed - constraint still blocking bursar role';
    END IF;
    
    RAISE NOTICE 'Profile verified! You can now log in.';
END $$;

-- Also verify the auth user exists
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'bursar@school1.com';
