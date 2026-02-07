-- DIAGNOSTIC: Check for triggers on auth.users and profiles
-- This will help us find hidden logic that might be failing

SELECT 
    tgname as trigger_name,
    relname as table_name,
    CASE WHEN nspname = 'auth' THEN 'auth' ELSE 'public' END as schema
FROM pg_trigger 
JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
WHERE nspname IN ('auth', 'public')
AND (relname = 'users' OR relname = 'profiles');

-- Also check for any constraints on profiles again
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- Check if there are any RLS policies on profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
