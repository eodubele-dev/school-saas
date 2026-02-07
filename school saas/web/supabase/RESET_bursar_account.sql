-- COMPLETE RESET: Delete and recreate bursar account with fresh password
-- This uses Supabase's built-in password hashing

DO $$
DECLARE
    v_tenant_id uuid;
    v_bursar_email text := 'bursar@school1.com';
    v_new_password text := 'BursarPass123!';  -- NEW PASSWORD
    v_bursar_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant school1 not found';
    END IF;

    -- Delete existing profile
    DELETE FROM public.profiles WHERE id = v_bursar_id;
    
    -- Delete existing auth user
    DELETE FROM auth.users WHERE id = v_bursar_id;
    
    -- Create new auth user with proper password hashing
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        aud,
        role
    ) VALUES (
        v_bursar_id,
        '00000000-0000-0000-0000-000000000000',
        v_bursar_email,
        crypt(v_new_password, gen_salt('bf')),  -- Bcrypt hash
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        'authenticated',
        'authenticated'
    );
    
    -- Create profile (this will trigger JWT sync)
    INSERT INTO public.profiles (id, tenant_id, full_name, role, created_at, updated_at)
    VALUES (v_bursar_id, v_tenant_id, 'Bursar Controller', 'bursar', now(), now());
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BURSAR ACCOUNT RESET COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: %', v_bursar_email;
    RAISE NOTICE 'NEW Password: %', v_new_password;
    RAISE NOTICE 'User ID: %', v_bursar_id;
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;
    RAISE NOTICE '========================================';
END $$;

-- Verify everything
SELECT 
    'AUTH USER:' as check_type,
    id::text as id, 
    email, 
    (email_confirmed_at IS NOT NULL)::text as confirmed,
    (encrypted_password IS NOT NULL)::text as has_password
FROM auth.users 
WHERE email = 'bursar@school1.com'

UNION ALL

SELECT 
    'PROFILE:' as check_type,
    id::text,
    role as email,
    (tenant_id IS NOT NULL)::text as confirmed,
    'true' as has_password
FROM public.profiles 
WHERE id = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
