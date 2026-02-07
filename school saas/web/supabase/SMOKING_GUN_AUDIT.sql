-- EDURNAL PLATINUM: SMOKING GUN AUDIT
-- Objective: Force identify the exact table or view breaking the schema cache.

-- 1. Check for views with invalid dependencies
SELECT 
    schemaname, 
    viewname, 
    definition 
FROM pg_views 
WHERE schemaname = 'public';

-- 2. Check for functions that might perform recursive queries
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('get_auth_tenant_id', 'sync_user_jwt_claims', 'get_user_schools');

-- 3. Check for specific RLS policies on ALL tables
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Check for unhandled "institutions" references
-- The IT department mentioned 'institutions' but we use 'tenants'.
-- Check if any foreign key or view is still looking for a literal 'institutions' table.
SELECT 
    conrelid::regclass as table_name, 
    conname as constraint_name, 
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE contype = 'f' 
AND confrelid::regclass::text ILIKE '%institution%';
