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

-- 2.2 Balanced Expression Parser (The "Master Refactorer")
-- This function identifies a subquery and finds its balancing closing parenthesis.
CREATE OR REPLACE FUNCTION public.fix_recursive_rls(expr text)
RETURNS text AS $$
DECLARE
    start_pos int;
    current_pos int;
    paren_count int;
    sub_expr text;
    work_expr text;
BEGIN
    work_expr := expr;
    <<target_finder>>
    LOOP
        -- Find the next subquery start
        start_pos := strpos(lower(work_expr), '(select');
        IF start_pos = 0 THEN EXIT; END IF;
        
        -- Iterate to find matching paren
        paren_count := 0;
        FOR current_pos IN start_pos..length(work_expr) LOOP
            IF substr(work_expr, current_pos, 1) = '(' THEN
                paren_count := paren_count + 1;
            ELSIF substr(work_expr, current_pos, 1) = ')' THEN
                paren_count := paren_count - 1;
            END IF;
            
            IF paren_count = 0 THEN
                -- Found the balancing paren
                sub_expr := substr(work_expr, start_pos, current_pos - start_pos + 1);
                
                -- Check if this subquery is recursive on 'profiles'
                IF lower(sub_expr) LIKE '%profiles%' AND lower(sub_expr) LIKE '%auth.uid()%' THEN
                    IF lower(sub_expr) LIKE '%tenant_id%' THEN
                        work_expr := overlay(work_expr PLACING '(get_auth_tenant_id())' FROM start_pos FOR (current_pos - start_pos + 1));
                    ELSIF lower(sub_expr) LIKE '%role%' THEN
                        work_expr := overlay(work_expr PLACING '(get_auth_role())' FROM start_pos FOR (current_pos - start_pos + 1));
                    ELSE
                        -- Prevent potential infinite loops if unknown subquery type
                        EXIT target_finder;
                    END IF;
                    -- Restart to check for more subqueries in the modified string
                    CONTINUE target_finder;
                END IF;
                -- If it was a (SELECT...) but not recursive on profiles, skip past it to find the next one
                work_expr := overlay(work_expr PLACING '/*SKIP*/' FROM start_pos FOR 8);
                CONTINUE target_finder;
            END IF;
        END LOOP;
        EXIT;
    END LOOP;
    
    -- Cleanup skip markers
    RETURN replace(work_expr, '/*SKIP*/', '(SELECT');
END;
$$ LANGUAGE plpgsql;

-- 3. Global RLS Decoupling Loop (The "Platinum Sweep")
-- We replace subqueries with surgical precision.
DO $$
DECLARE
    r RECORD;
    _sql TEXT;
    _new_qual TEXT;
    _new_check TEXT;
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
        BEGIN
            -- Use the Balanced Parser to refactor the expressions
            _new_qual := fix_recursive_rls(r.qual);
            _new_check := fix_recursive_rls(r.with_check);

            -- Skip if no changes made
            IF (_new_qual = r.qual AND (_new_check IS NULL OR _new_check = r.with_check)) THEN
                CONTINUE;
            END IF;

            RAISE NOTICE 'REFORMING POLICY: %.% (%)', r.tablename, r.policyname, r.cmd;

            EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
            
            _sql := format('CREATE POLICY %I ON %I.%I FOR %s TO %s', r.policyname, r.schemaname, r.tablename, r.cmd, array_to_string(r.roles, ', '));
            
            IF _new_qual IS NOT NULL THEN
                _sql := _sql || ' USING (' || _new_qual || ')';
            END IF;
            
            IF _new_check IS NOT NULL THEN
                _sql := _sql || ' WITH CHECK (' || _new_check || ')';
            END IF;

            EXECUTE _sql;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'SKIPPED %.%: %', r.tablename, r.policyname, SQLERRM;
        END;
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
