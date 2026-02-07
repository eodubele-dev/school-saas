-- EDURNAL PLATINUM: RLS ISOLATION TEST
-- Objective: Determine if RLS is the cause of "Database error querying schema"
-- Action: Temporarily disable RLS on core tables.

BEGIN;

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- Reload schema
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'RLS DISABLED ON CORE TABLES' as status;
