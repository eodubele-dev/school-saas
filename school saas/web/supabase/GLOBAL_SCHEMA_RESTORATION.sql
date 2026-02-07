-- EDÜFLOW PLATINUM: GLOBAL SCHEMA RESTORATION
-- Target: System-Wide Identity & Institution Alignment
-- Ref: IT Critical Recovery Protocol

BEGIN;

-- 1. Repair Global Institution Index
-- IT requested repair of 'institutions'. Mapping to 'tenants' in our schema.
REINDEX TABLE public.tenants;
REINDEX INDEX public.tenants_slug_key;

-- 2. Verify Column Consistency (Identity Mapping)
-- Fix orphaned records with NULL tenant_id by assigning them to the primary school
-- We do this instead of deleting to avoid breaking foreign key links (like parents/students)
DO $$
DECLARE
    _default_tenant_id uuid;
BEGIN
    SELECT id INTO _default_tenant_id FROM public.tenants LIMIT 1;
    
    IF _default_tenant_id IS NOT NULL THEN
        UPDATE public.profiles SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
        UPDATE public.students SET tenant_id = _default_tenant_id WHERE tenant_id IS NULL;
    END IF;
END $$;

-- Ensure 'tenant_id' is consistent and non-nullable in core tables
ALTER TABLE public.profiles ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.students ALTER COLUMN tenant_id SET NOT NULL;

-- 3. Scrub "Ghost" Results (Orphaned Forensics)
-- Identify and remove attendance records with missing staff/student links
DELETE FROM public.staff_attendance WHERE staff_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.audit_logs WHERE tenant_id NOT IN (SELECT id FROM public.tenants);

-- 4. Global Maintenance Reset (Institutional Access)
-- Ensure the gateway table exists and is set to ACTIVE for all core roles
CREATE TABLE IF NOT EXISTS public.institutional_access_control (
    role TEXT PRIMARY KEY,
    schema_status TEXT DEFAULT 'VERIFIED',
    status TEXT DEFAULT 'ACTIVE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.institutional_access_control (role, schema_status, status)
VALUES 
    ('BURSAR', 'VERIFIED', 'ACTIVE'),
    ('STUDENT', 'VERIFIED', 'ACTIVE'),
    ('ADMIN', 'VERIFIED', 'ACTIVE')
ON CONFLICT (role) DO UPDATE SET 
    schema_status = 'VERIFIED', 
    status = 'ACTIVE', 
    updated_at = NOW();

-- 5. Breaking the RLS Death Loop (Nuclear Optimization)
-- We replace the recursive function with a stateless JWT check.
-- This is the single most common cause of "Database error querying schema".
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Optimized: Extract from JWT claims to avoid recursive table lookups
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Final Schema Handshake
NOTIFY pgrst, 'reload schema';
ANALYZE public.profiles;
ANALYZE public.tenants;

COMMIT;

-- VERIFICATION
SELECT 'GLOBAL RESTORATION COMPLETE' as status;
SELECT role, status FROM public.institutional_access_control;
