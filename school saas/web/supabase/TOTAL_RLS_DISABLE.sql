-- TOTAL RLS DISABLE (The Nuclear Option)
-- Use this ONLY for debugging "Database error querying schema" when nothing else works.

BEGIN;

-- Disable RLS on ALL tables in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'Disabled RLS on %', r.tablename;
    END LOOP;
END $$;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';

COMMIT;

SELECT 'RLS DISABLED ON ALL TABLES' as status;
