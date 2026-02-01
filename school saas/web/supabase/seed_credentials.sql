-- SEED CREDENTIALS (UPDATED)
-- Run this in Supabase SQL Editor to create test users.

-- 0. Enable pgcrypto (Required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Variables
DO $$
DECLARE
    v_tenant_id uuid;
    v_student_record_id uuid;
    v_bursar_uid uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Fixed UUIDs for consistency
    v_student_uid uuid := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN
    -- 2. Ensure Tenant Exists (Demo School)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-school';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Demo School', 'demo-school', 'demo-school.localhost')
        RETURNING id INTO v_tenant_id;
        RAISE NOTICE 'Created Tenant: Demo School';
    END IF;

    -- 3. Ensure Student Record Exists (Emma Johnson)
    SELECT id INTO v_student_record_id FROM public.students WHERE full_name = 'Emma Johnson' LIMIT 1;

    -- Encrypt Password
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
        VALUES (v_bursar_uid, v_tenant_id, 'Bursar Admin', 'bursar')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created Bursar: bursar@demo-school.com / %', v_password;
    ELSE
        -- Update password just in case it was wrong
        UPDATE auth.users SET encrypted_password = v_encrypted_pw WHERE email = 'bursar@demo-school.com';
        RAISE NOTICE 'Bursar account updated.';
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
        VALUES (v_student_uid, v_tenant_id, 'Emma Johnson', 'student')
        ON CONFLICT (id) DO NOTHING;

        -- Link to Student Record
        -- We update the existing student record to point to this parent_id (conceptually student login acts as parent/self in this schema or we assume linkage via email/profile)
        -- NOTE: In your schema `students` has `parent_id` (profile ref). 
        -- If the student logs in directly, their profile ID should likely be linked or we rely on email match.
        -- For this demo, let's update the student record to have this new profile as 'parent_id' (or owner) 
        -- OR ensure the valid student lookup query uses email/name.
        
        -- Linking this profile as the "Owner/Parent" of the student record for RLS visibility
        IF v_student_record_id IS NOT NULL THEN
            UPDATE public.students SET parent_id = v_student_uid WHERE id = v_student_record_id;
        END IF;
        
        RAISE NOTICE 'Created Student: student@demo-school.com / %', v_password;
    ELSE
        -- Update password
        UPDATE auth.users SET encrypted_password = v_encrypted_pw WHERE email = 'student@demo-school.com';
        RAISE NOTICE 'Student account updated.';
    END IF;

END $$;
