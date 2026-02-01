-- SEED CREDENTIALS
-- Run this in Supabase SQL Editor to create test users.

-- 1. Variables
DO $$
DECLARE
    v_tenant_id uuid;
    v_student_record_id uuid;
    v_bursar_uid uuid := gen_random_uuid();
    v_student_uid uuid := gen_random_uuid();
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN
    -- Get Tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-school';
    
    -- Get Existing Student Record ID (Emma Johnson)
    SELECT id INTO v_student_record_id FROM public.students WHERE full_name = 'Emma Johnson' LIMIT 1;

    -- Encrypt Password (assuming pgcrypto is available, if not, use a known hash)
    -- If pgcrypto is not enabled, you might need to run: CREATE EXTENSION IF NOT EXISTS pgcrypto;
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -----------------------------------
    -- BURSAR ACCOUNT
    -----------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'bursar@demo-school.com') THEN
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
            'bursar@demo-school.com',
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Bursar Admin"}',
            now(),
            now(),
            'authenticated',
            false
        );

        -- Create Profile
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_bursar_uid, v_tenant_id, 'Bursar Admin', 'bursar');
        
        RAISE NOTICE 'Created Bursar: bursar@demo-school.com / %', v_password;
    ELSE
        RAISE NOTICE 'Bursar account already exists.';
    END IF;

    -----------------------------------
    -- STUDENT ACCOUNT
    -----------------------------------
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student@demo-school.com') THEN
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
            'student@demo-school.com',
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Emma Johnson"}',
            now(),
            now(),
            'authenticated',
            false
        );

        -- Create Profile
        INSERT INTO public.profiles (id, tenant_id, full_name, role)
        VALUES (v_student_uid, v_tenant_id, 'Emma Johnson', 'student');

        -- Link to Student Record (The Critical Part for Dashboard Data)
        -- We update the existing student record to point to this parent_id (conceptually student login acts as parent/self in this schema or we assume linkage via email/profile)
        -- NOTE: In your schema `students` has `parent_id` (profile ref). 
        -- If the student logs in directly, their profile ID should likely be linked or we rely on email match.
        -- For this demo, let's update the student record to have this new profile as 'parent_id' (or owner) 
        -- OR ensure the valid student lookup query uses email/name.
        
        -- Linking this profile as the "Owner/Parent" of the student record for RLS visibility
        UPDATE public.students SET parent_id = v_student_uid WHERE id = v_student_record_id;
        
        RAISE NOTICE 'Created Student: student@demo-school.com / %', v_password;
    ELSE
         RAISE NOTICE 'Student account already exists.';
    END IF;

END $$;
