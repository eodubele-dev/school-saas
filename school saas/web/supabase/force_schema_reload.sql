-- FORCE SCHEMA CACHE RELOAD
-- Run this in your Supabase Dashboard SQL Editor

-- Method 1: Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Method 2: Check if there are any pending schema changes
SELECT pg_notify('pgrst', 'reload schema');

-- Method 3: Verify the constraint is actually in the database
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_role_check';

-- Method 4: Force a schema refresh by touching the table
COMMENT ON TABLE public.profiles IS 'User profiles - updated to support bursar role';
