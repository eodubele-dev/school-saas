-- DIAGNOSTIC: Comprehensive Schema & RLS Check
-- This will help us find broken views or circular RLS dependencies

-- 1. Check all RLS policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
ORDER BY schemaname, tablename;

-- 2. Check for broken views
-- This query looks for views that might be invalid due to missing columns or changed types
SELECT 
    v.schemaname, 
    v.viewname, 
    v.viewowner
FROM pg_views v
WHERE v.schemaname NOT IN ('information_schema', 'pg_catalog');

-- 3. Check for circular functions
-- Look for functions that might be causing timeouts
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (routine_definition ILIKE '%profiles%' OR routine_definition ILIKE '%auth.uid%');

-- 4. Verify table existence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'audit_logs', 'staff_attendance', 'payroll_reconciliation_meta', 'institutional_access_control');
