-- DIAGNOSTIC: Check Parent-Student Linkage
-- Run this to see exactly what is in the database, bypassing application logic.

DO $$
DECLARE
    _email text := 'parent@school1.com';
    _user_id uuid;
    _tenant_id uuid;
    _student_count int;
BEGIN
    -- 1. Get User Info
    SELECT id, raw_app_meta_data->>'tenantId' 
    INTO _user_id, _tenant_id
    FROM auth.users 
    WHERE email = _email;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'DIAGNOSTIC RESULTS FOR: %', _email;
    RAISE NOTICE 'User ID: %', _user_id;
    RAISE NOTICE 'Tenant ID (Metadata): %', _tenant_id;
    RAISE NOTICE '------------------------------------------------';

    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users';
    END IF;

    -- 2. Check ACTUAL links in 'students' table (ignoring RLS if run as admin)
    SELECT count(*) INTO _student_count
    FROM public.students
    WHERE parent_id = _user_id;

    RAISE NOTICE 'Students linked via parent_id: %', _student_count;

    -- 3. List details of linked students (if any)
    IF _student_count > 0 THEN
        FOR _user_id IN SELECT id FROM public.students WHERE parent_id = _user_id LOOP
            RAISE NOTICE '  -> Found Student ID: %', _user_id;
        END LOOP;
    ELSE
        RAISE NOTICE '!! PROBLEM: No students have parent_id = %', _user_id;
        
        -- 4. Check if we can find ANY students in the system to verify table isn't empty
        SELECT count(*) INTO _student_count FROM public.students;
        RAISE NOTICE 'Total Students in System: %', _student_count;
    END IF;

    RAISE NOTICE '------------------------------------------------';
END $$;
