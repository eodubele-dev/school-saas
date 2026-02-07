-- Migration: Add Support for Additional User Roles
-- This migration extends the profiles table constraint to support bursar, registrar, owner, and manager roles

-- Drop the old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with all required roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));

-- Add comment for documentation
COMMENT ON CONSTRAINT profiles_role_check ON public.profiles IS 'Allows admin, teacher, parent, student, bursar, registrar, owner, and manager roles';
