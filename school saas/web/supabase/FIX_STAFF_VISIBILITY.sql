-- FIX STAFF VISIBILITY & SCHEMA MISMATCH
-- 1. Add Email Column to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Backfill Email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 3. Robust RLS Gateway Functions
-- Resolve issue where stale JWTs without 'tenantId' claim block visibility
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _tid uuid;
BEGIN
  -- Priority 1: JWT app_metadata (Fastest, Platinum standard)
  _tid := (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
  
  -- Priority 2: Direct lookup (Fallback for newly created users or stale sessions)
  IF _tid IS NULL THEN
    SELECT tenant_id INTO _tid FROM public.profiles WHERE id = auth.uid();
  END IF;
  
  RETURN _tid;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure 'owner' role is supported in staff role checks
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));

-- 5. Force Refresh
NOTIFY pgrst, 'reload schema';

-- 6. Verification
SELECT 'SCHEMA FIX COMPLETE' as status;
SELECT full_name, role, email, tenant_id FROM public.profiles WHERE tenant_id = 'e18076ff-0404-41aa-a97d-c2b884753ddc';
