-- MASTER OWNER LOGIN REPAIR
-- Run this in Supabase SQL Editor to fix constraints, recreate owner account, and reload cache.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_owner_uid uuid := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e33';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN 
    -- 2. Repair Profiles Role Constraint (Ensure 'owner' is allowed)
    BEGIN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint update failed or already handled: %', SQLERRM;
    END;

    -- 3. Ensure Tenant exists (Prioritize school1.com)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE domain = 'school1.com' OR slug = 'school1';
    
    IF v_tenant_id IS NULL THEN
         SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-school';
    END IF;

    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'No tenant found. Creating fallback school1 tenant.';
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- 4. Clean Start for Owner Auth (Delete existing to avoid conflicts)
    DELETE FROM public.profiles WHERE id = v_owner_uid;
    DELETE FROM auth.users WHERE email = 'owner@school1.com';

    -- 5. Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -- 6. Insert Owner (Confirmed & Standardized)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token
    ) VALUES (
        v_owner_uid, '00000000-0000-0000-0000-000000000000', 'owner@school1.com', 
        v_encrypted_pw, now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"School Proprietor"}', 
        'authenticated', 'authenticated', now(), now(), ''
    );

    -- 7. Insert Profile
    INSERT INTO public.profiles (id, tenant_id, full_name, role) VALUES 
    (v_owner_uid, v_tenant_id, 'School Proprietor', 'owner');

    RAISE NOTICE 'SUCCESS: Owner account recreated.';
    RAISE NOTICE 'Credentials: owner@school1.com / %', v_password;
END $$;

-- Force Supabase/PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
