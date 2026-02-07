-- MASTER BURSAR LOGIN & SCHEMA REPAIR
-- Run this in Supabase SQL Editor to fix constraints, recreate accounts, and reload cache.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
    v_student_uid uuid := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d22';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN 
    -- 2. Repair Profiles Role Constraint
    BEGIN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
            CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner'));
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Constraint update failed or already handled: %', SQLERRM;
    END;

    -- 3. Ensure Tenant exists
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' OR domain = 'school1.com' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- 4. Clean Start for Auth
    DELETE FROM public.profiles WHERE id IN (v_bursar_uid, v_student_uid);
    DELETE FROM auth.users WHERE email IN ('bursar@school1.com', 'student@school1.com');

    -- 5. Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -- 6. Insert Bursar (Confirmed & Standardized)
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

    -- 7. Insert Student (Confirmed)
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token
    ) VALUES (
        v_student_uid, '00000000-0000-0000-0000-000000000000', 'student@school1.com', 
        v_encrypted_pw, now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"Test Student"}', 
        'authenticated', 'authenticated', now(), now(), ''
    );

    -- 8. Insert Profiles
    INSERT INTO public.profiles (id, tenant_id, full_name, role) VALUES 
    (v_bursar_uid, v_tenant_id, 'Bursar Controller', 'bursar'),
    (v_student_uid, v_tenant_id, 'Test Student', 'student');

    RAISE NOTICE 'SUCCESS: Schema repaired and accounts recreated.';
    RAISE NOTICE 'Bursar: bursar@school1.com / %', v_password;
END $$;

-- Force Supabase/PostgREST to reload the schema cache (Crucial Fix)
NOTIFY pgrst, 'reload schema';
