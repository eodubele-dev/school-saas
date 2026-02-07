-- SEED CREDENTIALS FOR SCHOOL1.COM
-- Run this in Supabase SQL Editor to create test users for the Bursar and Student dashboards.

-- 0. Enable pgcrypto (Required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Variables
DO $$
DECLARE
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
    v_student_uid uuid := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN
    -- 2. Ensure Tenant Exists (Achievers Minds Schools / school1.com)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE domain = 'school1.com' OR slug = 'school1';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
        RAISE NOTICE 'Created Tenant: Achievers Minds Schools';
    END IF;

    -- Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -----------------------------------
    -- BURSAR ACCOUNT
    -----------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bursar@school1.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            is_super_admin
        ) VALUES (
            v_bursar_uid,
            '00000000-0000-0000-0000-000000000000',
            'bursar@school1.com',
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Bursar Controller"}',
            now(),
            now(),
            'authenticated',
            false
        );

        -- Create Profile
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_bursar_uid, v_tenant_id, 'Bursar Controller', 'bursar')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created Bursar: bursar@school1.com / %', v_password;
    ELSE
        UPDATE auth.users SET encrypted_password = v_encrypted_pw WHERE email = 'bursar@school1.com';
        RAISE NOTICE 'Bursar account updated.';
    END IF;

    -----------------------------------
    -- STUDENT ACCOUNT
    -----------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student@school1.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            is_super_admin
        ) VALUES (
            v_student_uid,
            '00000000-0000-0000-0000-000000000000',
            'student@school1.com',
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Test Student"}',
            now(),
            now(),
            'authenticated',
            false
        );

        -- Create Profile
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_student_uid, v_tenant_id, 'Test Student', 'student')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created Student: student@school1.com / %', v_password;
    ELSE
        UPDATE auth.users SET encrypted_password = v_encrypted_pw WHERE email = 'student@school1.com';
        RAISE NOTICE 'Student account updated.';
    END IF;

END $$;
