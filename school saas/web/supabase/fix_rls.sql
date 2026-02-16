-- FIX RLS: Allow users to see all profiles in their tenant

-- 1. Create/Update the helper function to get current user's tenant safeley
-- 'security definer' allows this function to bypass RLS when reading the profiles table to get the ID
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Profiles viewable by same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Re-apply policies

-- A. VIEW: Allow seeing ANY profile that belongs to the same tenant
CREATE POLICY "Profiles viewable by same tenant"
ON public.profiles
FOR SELECT
USING (
  tenant_id = get_auth_tenant_id()
);

-- B. UPDATE: Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  id = auth.uid()
);

-- C. INSERT: Users can insert their own profile (often needed for signup triggers)
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  id = auth.uid()
);
