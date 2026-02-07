-- SIMPLE FIX: Just create the missing profile
-- This assumes the auth user already exists (which we confirmed it does)

DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
BEGIN 
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant school1 not found. Please create it first.';
    END IF;

    -- Delete existing profile if any
    DELETE FROM public.profiles WHERE id = v_bursar_uid;

    -- Insert the profile (this is what's probably missing)
    INSERT INTO public.profiles (id, tenant_id, full_name, role) 
    VALUES (v_bursar_uid, v_tenant_id, 'Bursar Controller', 'bursar');

    RAISE NOTICE 'Profile created successfully!';
    RAISE NOTICE 'Try logging in with: bursar@school1.com / password123';
END $$;
