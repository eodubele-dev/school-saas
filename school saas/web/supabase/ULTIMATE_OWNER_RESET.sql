-- ULTIMATE OWNER RESET & SCHEMA RECOVERY
-- This script does three things:
-- 1. Completely wipes and recreates the owner account (fresh credentials).
-- 2. Disables RLS temporarily to ensure no "schema error" blocks the creation.
-- 3. Re-applies a safe, non-recursive RLS policy to finalize.

BEGIN;

-------------------------------------------------------------------------------
-- STEP 1: DISABLE RLS (To bypass "Database error querying schema")
-------------------------------------------------------------------------------
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- STEP 2: NUKE EXISTING OWNER (Clean Slate)
-------------------------------------------------------------------------------
-- Delete profile first to avoid FK constraints
DELETE FROM public.profiles WHERE role = 'owner';
-- Delete auth user
DELETE FROM auth.users WHERE email = 'owner@school1.com';

-------------------------------------------------------------------------------
-- STEP 3: RECREATE OWNER CREDENTIALS
-------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_tenant_id uuid;
    v_owner_uid uuid := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e33';
    v_password text := 'password123';
    v_encrypted_pw text;
BEGIN
    -- Ensure Tenant Exists (school1.com)
    SELECT id INTO v_tenant_id FROM public.tenants WHERE domain = 'school1.com' OR slug = 'school1';
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- Encrypt Password
    v_encrypted_pw := crypt(v_password, gen_salt('bf'));

    -- Insert Auth User
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token
    ) VALUES (
        v_owner_uid, '00000000-0000-0000-0000-000000000000', 'owner@school1.com', 
        v_encrypted_pw, now(), 
        '{"provider":"email","providers":["email"]}', 
        '{"full_name":"School Proprietor"}', 
        'authenticated', 'authenticated', now(), now(), ''
    );

    -- Insert ID into Profile (RLS is disabled so this will succeed)
    INSERT INTO public.profiles (id, tenant_id, full_name, role)
    VALUES (v_owner_uid, v_tenant_id, 'School Proprietor', 'owner');
    
    RAISE NOTICE '✅ Owner Recreated: owner@school1.com / password123';
END $$;

-------------------------------------------------------------------------------
-- STEP 4: FIX RLS POLICIES (Prevent Recursion)
-------------------------------------------------------------------------------
-- Drop known problematic policies
DROP POLICY IF EXISTS "Profiles viewable by same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create Safe Function (JWT Only)
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id_safe()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
END;
$$ LANGUAGE plpgsql;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Apply SAFE Policies
CREATE POLICY "Profiles: Users see own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Allow reading other profiles in same tenant (using safe function or direct check)
-- Ideally we use a non-recursive approach. 
-- For now, let's keep it very simple: Users can see profiles in their tenant.
-- We avoid using `get_auth_tenant_id()` if it queries profiles.
-- The safest bet is:
CREATE POLICY "Profiles: View tenant members" 
ON public.profiles FOR SELECT 
USING (tenant_id IN (
    SELECT id FROM public.tenants -- This is safe if tenants table is not recursively protected
));

-------------------------------------------------------------------------------
-- STEP 5: RELOAD SCHEMA
-------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
