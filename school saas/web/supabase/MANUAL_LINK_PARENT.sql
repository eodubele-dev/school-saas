-- FIX: Manual Link of Students to Parent
-- Run this script to force-link students to your user account for testing.

DO $$
DECLARE
    -- !!! CHANGE THIS TO YOUR ACTUAL LOGIN EMAIL !!!
    _target_email text := 'parent@school1.com'; 
    
    _user_id uuid;
    _tenant_id uuid;
BEGIN
    -- Get User ID from Email
    SELECT id, raw_app_meta_data->>'tenantId' 
    INTO _user_id, _tenant_id
    FROM auth.users 
    WHERE email = _target_email;

    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'User not found! Please check the email address: %', _target_email;
    END IF;

    RAISE NOTICE 'Found User ID: %', _user_id;

    -- Update 2 Students to belong to this parent
    -- We pick 2 students from the same tenant (or any if tenant is null)
    UPDATE public.students
    SET parent_id = _user_id
    WHERE id IN (
        SELECT id FROM public.students 
        LIMIT 2
    );

    RAISE NOTICE 'Successfully linked 2 students to your account.';
END $$;
