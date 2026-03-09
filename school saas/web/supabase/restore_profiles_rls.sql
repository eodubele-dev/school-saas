-- RESTORE PROFILE RLS POLICIES
-- This script repairs the profiles table access after "Emergency Fixes" stripped update permissions.

BEGIN;

-- 1. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Clean Sweep of old policies to prevent conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 3. Define Safe Tenant Lookup (Ensuring no recursion)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- STRICTLY use JWT metadata. If unavailable, return NULL (do not query the profiles table itself).
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply New Policies

-- A. Users can view their own profile record
CREATE POLICY "Users Own Profile View" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- B. Users can view other profiles in the same tenant (for team/admin visibility)
-- Uses the safe JWT-based tenant lookup to avoid infinite recursion.
CREATE POLICY "Tenant Profiles Visibility" 
ON public.profiles FOR SELECT 
USING (tenant_id = public.get_auth_tenant_id());

-- C. Users can UPDATE their own profile information
-- Essential for "My Profile" settings to work!
CREATE POLICY "Users Own Profile Update" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- D. Service Role has full access (Bypasses RLS for system tasks/seeding)
CREATE POLICY "Service Role Full Access" 
ON public.profiles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. Broadcast Schema Reload
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'SUCCESS: Profiles RLS restored with UPDATE permissions.' as status;
