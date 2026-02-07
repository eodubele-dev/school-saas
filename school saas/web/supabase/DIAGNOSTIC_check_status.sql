-- DIAGNOSTIC: Check Current Constraint Status
-- Run this to see what the current constraint actually says

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Also check if the bursar profile exists
SELECT id, role, tenant_id, full_name 
FROM public.profiles 
WHERE role = 'bursar';

-- Check if bursar auth user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'bursar@school1.com';
