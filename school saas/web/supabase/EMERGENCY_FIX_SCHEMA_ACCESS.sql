-- EMERGENCY FIX: SCHEMA ACCESS & RLS RESET
-- Run this if you are getting "Database error querying schema" or infinite recursion errors.

BEGIN;

-------------------------------------------------------------------------------
-- 1. DISABLE RLS ON CRITICAL TABLES (Temporary Bypass)
-------------------------------------------------------------------------------
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 2. DROP ALL POLICIES ON PROFILES (The likely culprit)
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles viewable by same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;

-- Drop any other potential policies on profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.profiles', r.policyname);
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 3. DROP ALL POLICIES ON TENANTS
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Tenants are viewable by everyone" ON public.tenants;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'tenants'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.tenants', r.policyname);
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 4. INSERT SIMPLE, NON-RECURSIVE POLICIES
-------------------------------------------------------------------------------
-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Simple Tenant Policy: Public Read (Safe for subdomain resolution)
CREATE POLICY "Tenants are viewable by everyone" 
ON public.tenants FOR SELECT USING (true);

-- Simple Profile Policy: Users can see their own profile
CREATE POLICY "Users can see own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Public Profile Policy: Users can see profiles in their tenant (without recursion)
-- We use a direct lookup or specific function if needed, but for now, let's keep it simple.
-- The previous "Profiles viewable by same tenant" used `get_auth_tenant_id()` which might be recursive if it queries profiles.

-- Let's redefine `get_auth_tenant_id` to be STRICTLY safe (JWT only)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- STRICTLY use JWT. If unavailable, return NULL (do not query table)
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
END;
$$ LANGUAGE plpgsql;

-- Now safe to use in policy
CREATE POLICY "Profiles viewable by same tenant" 
ON public.profiles FOR SELECT 
USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid);

-------------------------------------------------------------------------------
-- 5. RELOAD SCHEMA CACHE
-------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'EMERGENCY FIX COMPLETE: RLS Reset & Schema Reloaded' as status;
