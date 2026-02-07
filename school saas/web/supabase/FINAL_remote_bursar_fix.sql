-- FINAL FIX FOR REMOTE SUPABASE
-- Run this in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard)

-- Step 1: Fix the constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager'));

-- Step 2: Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_role_check';

-- Step 3: Ensure bursar profile exists
DO $$ 
DECLARE 
    v_tenant_id uuid;
    v_bursar_uid uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c11';
BEGIN 
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'school1' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Tenant school1 not found';
    END IF;

    -- Ensure profile exists
    INSERT INTO public.profiles (id, tenant_id, full_name, role) 
    VALUES (v_bursar_uid, v_tenant_id, 'Bursar Controller', 'bursar')
    ON CONFLICT (id) DO UPDATE SET role = 'bursar', tenant_id = v_tenant_id;

    RAISE NOTICE 'Bursar profile ready!';
END $$;
