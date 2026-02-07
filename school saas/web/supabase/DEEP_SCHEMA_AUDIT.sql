-- EDURNAL PLATINUM: DEEP SCHEMA AUDIT
-- Objective: Find the exact broken element causing "Database error querying schema"

BEGIN;

-- 1. Check for Broken Views (Views referencing non-existent objects)
-- We attempt to query each view. If it fails, we catch the error.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'public' LOOP
        BEGIN
            EXECUTE format('SELECT 1 FROM %I.%I LIMIT 0', r.schemaname, r.viewname);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'BROKEN VIEW FOUND: %.% - Error: %', r.schemaname, r.viewname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. Check for Recursive Policy Dependencies
-- Look for policies that call functions that query the same table
SELECT 
    schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE qual ILIKE '%get_auth_tenant_id%'
   OR with_check ILIKE '%get_auth_tenant_id%';

-- 3. Audit 'get_auth_tenant_id' uses
SELECT 
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname = 'get_auth_tenant_id';

-- 4. Check for Table/Column Mismatches in common queries
-- Sometimes a column exists in the schema.sql but not in the real DB
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 5. Force Re-indexing of System Catalogs (Rare but sometimes necessary)
-- Note: This requires high privileges
-- REINDEX TABLE pg_attribute;
-- REINDEX TABLE pg_class;

COMMIT;
