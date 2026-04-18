-- RESTORE TENANT ISOLATION
-- This script re-enables Row Level Security (RLS) on core tables and applies stateless JWT policies.
-- It fixes the issue where test data from one tenant leaks into another tenant's view.
-- It uses `auth.jwt() -> 'app_metadata' ->> 'tenantId'` to prevent the recursive schema crashes.

BEGIN;

-- 1. Enable RLS on core tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing potentially recursive or disabled policies
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.students;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.classes;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.profiles;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.transactions;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.fees;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.hostel_rooms;
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON public.achievements;

-- We also drop the default 'Students viewable by tenant' if it exists to replace with JWT version
DROP POLICY IF EXISTS "Students viewable by tenant" ON public.students;

-- 3. Create Fast Stateless JWT Policies for all operations (SELECT, INSERT, UPDATE, DELETE)
-- This ensures that users can ONLY interact with data belonging to their own tenant_id.

-- Students
CREATE POLICY "Tenant Isolation Policy" ON public.students
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Classes
CREATE POLICY "Tenant Isolation Policy" ON public.classes
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Profiles
CREATE POLICY "Tenant Isolation Policy" ON public.profiles
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Transactions
CREATE POLICY "Tenant Isolation Policy" ON public.transactions
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Fees
CREATE POLICY "Tenant Isolation Policy" ON public.fees
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Hostel Rooms
CREATE POLICY "Tenant Isolation Policy" ON public.hostel_rooms
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- Achievements
CREATE POLICY "Tenant Isolation Policy" ON public.achievements
AS PERMISSIVE FOR ALL
USING (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid)
WITH CHECK (tenant_id = (NULLIF(auth.jwt()->'app_metadata'->>'tenantId', ''))::uuid);

-- 4. Special allowance for the initial Profile creation during onboarding
-- If a user creates an account, they may not have a JWT tenantId yet in their first second.
-- The server-side AdminClient (Service Role Key) bypasses RLS and will handle creation.
-- The policies above restrict standard users from accessing cross-tenant data.

NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'RLS RESTORED WITH HIGH-PERFORMANCE JWT POLICIES' as status;
