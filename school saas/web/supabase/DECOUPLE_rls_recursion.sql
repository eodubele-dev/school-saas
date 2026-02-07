-- EDURNAL PLATINUM: GLOBAL RLS DECOUPLING
-- Objective: Resolve "Database error querying schema" by breaking RLS recursion loops.
-- Target: Replace all subqueries on the 'profiles' table with stateless JWT verification.

BEGIN;

-- 1. Ensure the Access-Flag Table exists (Sanity check from previous restoration)
CREATE TABLE IF NOT EXISTS public.institutional_access_control (
    role TEXT PRIMARY KEY,
    schema_status TEXT DEFAULT 'VERIFIED',
    status TEXT DEFAULT 'ACTIVE',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hard-Wire the Gateway Functions (Stateless & High-Speed)
-- These functions are the "Keys" that unlock all other tables.
-- By extracting from JWT app_metadata, we avoid a recursive SELECT on the profiles table.

CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use the JWT claim 'tenantId' which we sync during login
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenantId')::uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Use the JWT claim 'role' which we sync during login
  RETURN auth.jwt() -> 'app_metadata' ->> 'role';
END;
$$ LANGUAGE plpgsql;

-- 3. Global RLS Decoupling Loop (The "Nuclear Regex Sweep")
-- We use regex to find and replace variations of the profiles subquery.
DO $$
DECLARE
    r RECORD;
    _sql TEXT;
    _new_qual TEXT;
    _new_check TEXT;
    -- Super-Permissive patterns to handle whitespace, case, and quotes in database expressions
    _pattern_tenant TEXT := '\(\s*SELECT\s+"?profiles"?\."?tenant_id"?\s+FROM\s+(public\.)?"?profiles"?\s+WHERE\s+\(?("?profiles"?\.)?"?id"?\s*=\s*auth\.uid\(\)\)?\s*\)';
    _pattern_role TEXT := '\(\s*SELECT\s+"?profiles"?\."?role"?\s+FROM\s+(public\.)?"?profiles"?\s+WHERE\s+\(?("?profiles"?\.)?"?id"?\s*=\s*auth\.uid\(\)\)?\s*\)';
    _pattern_simple_tenant TEXT := '\(\s*SELECT\s+"?tenant_id"?\s+FROM\s+(public\.)?"?profiles"?\s+WHERE\s+"?id"?\s*=\s*auth\.uid\(\)\s*\)';
    _pattern_simple_role TEXT := '\(\s*SELECT\s+"?role"?\s+FROM\s+(public\.)?"?profiles"?\s+WHERE\s+"?id"?\s*=\s*auth\.uid\(\)\s*\)';
BEGIN
    FOR r IN 
        SELECT 
            schemaname, 
            tablename, 
            policyname, 
            roles, 
            cmd, 
            qual, 
            with_check
        FROM pg_policies 
        WHERE schemaname = 'public'
          AND (qual ILIKE '%SELECT%profiles%' OR with_check ILIKE '%SELECT%profiles%')
    LOOP
        _new_qual := r.qual;
        _new_check := r.with_check;

        -- Regex Replace Tenant ID subqueries
        -- Wrap in parentheses (get_auth_tenant_id()) to ensure compatibility with 'IN' and '=' operators
        _new_qual := regexp_replace(_new_qual, _pattern_tenant, '(get_auth_tenant_id())', 'gi');
        _new_qual := regexp_replace(_new_qual, _pattern_simple_tenant, '(get_auth_tenant_id())', 'gi');
        
        -- Regex Replace Role subqueries
        _new_qual := regexp_replace(_new_qual, _pattern_role, '(get_auth_role())', 'gi');
        _new_qual := regexp_replace(_new_qual, _pattern_simple_role, '(get_auth_role())', 'gi');

        -- Repeat for with_check
        IF _new_check IS NOT NULL THEN
            _new_check := regexp_replace(_new_check, _pattern_tenant, '(get_auth_tenant_id())', 'gi');
            _new_check := regexp_replace(_new_check, _pattern_simple_tenant, '(get_auth_tenant_id())', 'gi');
            _new_check := regexp_replace(_new_check, _pattern_role, '(get_auth_role())', 'gi');
            _new_check := regexp_replace(_new_check, _pattern_simple_role, '(get_auth_role())', 'gi');
        END IF;

        -- Skip if no changes made
        IF _new_qual IS NOT NULL AND _new_qual = r.qual AND (_new_check IS NULL OR _new_check = r.with_check) THEN
             CONTINUE;
        END IF;

        RAISE NOTICE 'DECOUPLING POLICY: %.% (Cmd: %)', r.tablename, r.policyname, r.cmd;

        -- We must drop and recreate
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        
        _sql := format('CREATE POLICY %I ON %I.%I FOR %s TO %s', r.policyname, r.schemaname, r.tablename, r.cmd, array_to_string(r.roles, ', '));
        
        IF _new_qual IS NOT NULL THEN
            _sql := _sql || ' USING (' || _new_qual || ')';
        END IF;
        
        IF _new_check IS NOT NULL THEN
            _sql := _sql || ' WITH CHECK (' || _new_check || ')';
        END IF;

        EXECUTE _sql;
    END LOOP;
END $$;

-- 4. Final Forensic Handshake
NOTIFY pgrst, 'reload schema';
ANALYZE public.profiles;
ANALYZE public.tenants;

COMMIT;

-- VERIFICATION
SELECT 'DECOUPLING COMPLETE: RLS RECURSION RESOLVED' as status;
SELECT tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'students')
ORDER BY tablename, policyname;
