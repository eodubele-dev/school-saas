-- TEST: Try to manually verify the password
-- This will help us determine if the password is correct

DO $$
DECLARE
    v_stored_password text;
    v_test_password text := 'password123';
    v_match boolean;
BEGIN
    -- Get the encrypted password from auth.users
    SELECT encrypted_password INTO v_stored_password
    FROM auth.users
    WHERE email = 'bursar@school1.com';
    
    IF v_stored_password IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Test if the password matches
    v_match := (v_stored_password = crypt(v_test_password, v_stored_password));
    
    IF v_match THEN
        RAISE NOTICE 'PASSWORD MATCHES! The password is correct.';
    ELSE
        RAISE NOTICE 'PASSWORD DOES NOT MATCH! Need to reset password.';
    END IF;
END $$;

-- Also show the user details
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    raw_app_meta_data
FROM auth.users
WHERE email = 'bursar@school1.com';
