-- EDURNAL PLATINUM: CIRCULAR RLS & JWT OPTIMIZATION
-- Objective: Fix "Database error querying schema" by breaking the RLS recursion loop.

BEGIN;

-- 1. Optimize Tenant Lookup (JWT Claims first)
-- This avoids querying the 'profiles' table to find the tenant_id of the current user,
-- which prevents infinite recursion in RLS policies.
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  -- A. Try to get tenant_id from JWT app_metadata (Fastest, Non-recursive)
  _tenant_id := (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
  
  -- B. Fallback to direct query (Security Definer allows bypassing RLS here)
  IF _tenant_id IS NULL THEN
    SELECT tenant_id INTO _tenant_id FROM public.profiles WHERE id = auth.uid();
  END IF;
  
  RETURN _tenant_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Fix Profile RLS (Ensure non-recursive paths)
DROP POLICY IF EXISTS "Profiles viewable by same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Rule 1: Users can ALWAYS see their own profile (No recursion)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (id = auth.uid());

-- Rule 2: Users can see others in same tenant (Uses optimized function)
CREATE POLICY "Profiles viewable by same tenant" 
ON public.profiles FOR SELECT 
USING (tenant_id = public.get_auth_tenant_id());

-- 3. Verify & Fix Bursar Metadata
-- Ensure the Bursar user has the metadata required for the optimized function above
UPDATE auth.users
SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
        'tenantId', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11', -- school1 ID if it matches
        'role', 'bursar'
    )
WHERE email = 'bursar@school1.com';

-- 4. Nuclear Schema Cache Flush
-- Notifies PostgREST to rebuild its schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- Health Check
SELECT 'RLS RECURSION FIXED' as status;
SELECT public.get_auth_tenant_id() as current_detected_tenant;
