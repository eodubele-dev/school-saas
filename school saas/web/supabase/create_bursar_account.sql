-- STEP 2: Create Bursar Account (Run AFTER constraint fix)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN 
    -- 1. Get or Create Tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
        RAISE NOTICE 'Created tenant: school1';
    END IF;

    -- 2. Clean existing bursar records
    DELETE FROM public.profiles WHERE id = v_bursar_uid;
    DELETE FROM auth.users WHERE email = 'bursar@school1.com';

    -- 3. Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -- 4. Create Auth User
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token
    ) VALUES (
        v_bursar_uid, '00000000-0000-0000-0000-000000000000', 'bursar@school1.com', 
        v_encrypted_pw, now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"Bursar Controller"}', 
        'authenticated', 'authenticated', now(), now(), ''
    );

    -- 5. Create Profile (This will now work because constraint is fixed)
    INSERT INTO public.profiles (id, tenant_id, full_name, role) 
    VALUES (v_bursar_uid, v_tenant_id, 'Bursar Controller', 'bursar');

    RAISE NOTICE 'SUCCESS! Bursar account created.';
    RAISE NOTICE 'Email: bursar@school1.com';
    RAISE NOTICE 'Password: %', v_password;
END $$;
