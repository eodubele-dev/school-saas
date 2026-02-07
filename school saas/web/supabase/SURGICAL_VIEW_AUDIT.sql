-- EDURNAL PLATINUM: SURGICAL VIEW AUDIT
-- Objective: Identify any VIEW that is broken and preventing PostgREST introspection.

DO $$
DECLARE
    v_record RECORD;
    v_test_query TEXT;
BEGIN
    RAISE NOTICE 'Starting Global View Audit...';
    
    FOR v_record IN 
        SELECT table_schema, table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        BEGIN
            v_test_query := format('SELECT * FROM %I.%I LIMIT 0', v_record.table_schema, v_record.table_name);
            EXECUTE v_test_query;
            -- RAISE NOTICE 'SUCCESS: View %.% is valid.', v_record.table_schema, v_record.table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'CRITICAL FAILURE: View %.% is BROKEN. Error: %', v_record.table_schema, v_record.table_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Audit Complete.';
END $$;
