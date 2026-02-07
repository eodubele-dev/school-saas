-- SIMPLE FIX: Reset bursar password and let the trigger populate JWT
-- This approach will force the JWT sync trigger to fire

DO $$
DECLARE
    v_bursar_id uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
BEGIN
    -- Update the profile's updated_at to trigger the JWT sync
    UPDATE public.profiles
    SET updated_at = now()
    WHERE id = v_bursar_id;
    
    RAISE NOTICE 'Profile updated - JWT sync trigger should have fired';
END $$;

-- Check if JWT was populated
SELECT 
    id,
    email,
    raw_app_meta_data,
    raw_app_meta_data->>'tenantId' as tenant_id_in_jwt,
    raw_app_meta_data->>'role' as role_in_jwt
FROM auth.users
WHERE email = 'bursar@school1.com';
