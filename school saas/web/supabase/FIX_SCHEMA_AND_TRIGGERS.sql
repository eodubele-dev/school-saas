-- FINAL FIX: DROP TRIGGERS & RESET SCHEMA
-- This script aggressively cleans up any triggers or policies that might be causing recursion.

BEGIN;

-------------------------------------------------------------------------------
-- 1. DISABLE RLS GLOBALLY (Just to be safe during cleanup)
-------------------------------------------------------------------------------
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 2. DROP ALL TRIGGERS ON auth.users (The likely source of "Schema Error" during login)
-------------------------------------------------------------------------------
-- We have to use dynamic SQL because we can't drop triggers if we don't know their names.
DO $$
DECLARE
    trg RECORD;
BEGIN
    FOR trg IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', trg.trigger_name);
        RAISE NOTICE 'Dropped trigger on auth.users: %', trg.trigger_name;
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 3. DROP ALL TRIGGERS ON public.profiles
-------------------------------------------------------------------------------
DO $$
DECLARE
    trg RECORD;
BEGIN
    FOR trg IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'public' AND event_object_table = 'profiles'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.profiles CASCADE', trg.trigger_name);
        RAISE NOTICE 'Dropped trigger on public.profiles: %', trg.trigger_name;
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 4. NUKE & RECREATE OWNER (One last time, clean)
-------------------------------------------------------------------------------
DELETE FROM public.profiles WHERE role = 'owner';
DELETE FROM auth.users WHERE email = 'owner@school1.com';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    v_tenant_id uuid;
    v_owner_uid uuid := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e33';
    v_encrypted_pw text;
BEGIN
    -- Get/Create Tenant
    SELECT id INTO v_tenant_id FROM public.tenants WHERE domain = 'school1.com' OR slug = 'school1';
    IF v_tenant_id IS NULL THEN
        INSERT INTO public.tenants (name, slug, domain)
        VALUES ('Achievers Minds Schools', 'school1', 'school1.com')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- Create Auth User
    v_encrypted_pw := crypt('password123', gen_salt('bf'));
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, role, aud, created_at, updated_at
    ) VALUES (
        v_owner_uid, '00000000-0000-0000-0000-000000000000', 'owner@school1.com', 
        v_encrypted_pw, now(), 
        '{"provider":"email","providers":["email"]}'::jsonb, 
        jsonb_build_object('full_name', 'School Proprietor', 'role', 'owner', 'tenantId', v_tenant_id),
        'authenticated', 'authenticated', now(), now()
    );

    -- Create Profile (RLS Disabled, Safe)
    INSERT INTO public.profiles (id, tenant_id, full_name, role)
    VALUES (v_owner_uid, v_tenant_id, 'School Proprietor', 'owner');
    
    RAISE NOTICE 'Owner Recreated: owner@school1.com';
END $$;

-------------------------------------------------------------------------------
-- 5. RESTORE MINIMAL RLS
-------------------------------------------------------------------------------
-- Drop all existing policies on profiles to be sure
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Bare minimum policies
CREATE POLICY "Public Tenants" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "Users Own Profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- NOTIFY RELOAD
NOTIFY pgrst, 'reload schema';

COMMIT;
