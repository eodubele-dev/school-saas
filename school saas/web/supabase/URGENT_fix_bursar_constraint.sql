-- URGENT: Direct Constraint Fix
-- This MUST be run first before any user creation

-- Step 1: Drop the old constraint (it's blocking everything)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Step 2: Add the new constraint with ALL roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));

-- Step 3: Verify it worked
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_role_check';
