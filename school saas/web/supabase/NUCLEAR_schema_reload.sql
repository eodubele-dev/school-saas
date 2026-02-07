-- NUCLEAR OPTION: Complete Schema Reload
-- This script will force PostgREST and Supabase to reload the entire schema

-- 1. Drop and recreate the constraint (forces schema change detection)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));

-- 2. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 3. Update table metadata to trigger schema detection
COMMENT ON TABLE public.profiles IS 'User profiles - supports all roles including bursar (updated 2024-02-07)';

-- 4. Verify constraint
SELECT 
    'CONSTRAINT CHECK:' as status,
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_role_check';

-- 5. Verify bursar profile exists
SELECT 
    'PROFILE CHECK:' as status,
    id, tenant_id, full_name, role, created_at
FROM public.profiles 
WHERE role = 'bursar';

-- 6. Verify auth user exists
SELECT 
    'AUTH USER CHECK:' as status,
    id, email, email_confirmed_at
FROM auth.users 
WHERE email = 'bursar@school1.com';

-- 7. Test the get_user_schools function
SELECT 
    'FUNCTION TEST:' as status,
    *
FROM public.get_user_schools('bursar@school1.com');
