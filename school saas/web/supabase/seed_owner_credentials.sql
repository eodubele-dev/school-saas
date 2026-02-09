-- SEED OWNER CREDENTIALS
-- Run this in Supabase SQL Editor to create a test OWNER user.

-- 0. Enable pgcrypto (Required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Variables
DO $$
DECLARE
    v_tenant_id uuid;
    v_owner_uid uuid := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e33'; -- Unique ID for owner
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN
    -- 2. Ensure Tenant Exists (school1.com)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE domain = 'school1.com' OR slug = 'school1';
    
    IF v_tenant_id IS NULL THEN
         SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-school';
    END IF;

    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No tenant found. Please run complete_setup.sql first.';
        RETURN;
    END IF;

    -- Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -----------------------------------
    -- OWNER ACCOUNT
    -----------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'owner@school1.com') THEN
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
            v_owner_uid,
            '00000000-0000-0000-0000-000000000000',
            'owner@school1.com',
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"School Proprietor"}',
            now(),
            now(),
            'authenticated',
            false
        );

        -- Create Profile
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_owner_uid, v_tenant_id, 'School Proprietor', 'owner')
        ON CONFLICT (id) DO UPDATE SET role = 'owner', tenant_id = v_tenant_id;
        
        RAISE NOTICE 'Created Owner: owner@school1.com / %', v_password;
    ELSE
        -- Update password just in case
        UPDATE auth.users SET encrypted_password = v_encrypted_pw WHERE email = 'owner@school1.com';
        -- Ensure profile exists and has owner role and correct tenant
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_owner_uid, v_tenant_id, 'School Proprietor', 'owner')
        ON CONFLICT (id) DO UPDATE SET role = 'owner', tenant_id = v_tenant_id;
        
        RAISE NOTICE 'Owner account updated: owner@school1.com';
    END IF;
END $$;
