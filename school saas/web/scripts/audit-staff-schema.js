const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jggcixrapxccbxckuofw.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function check() {
    console.log('--- Profiles Table Columns ---');
    // We can't query information_schema easily with RLS/RPC restrictions sometimes, 
    // so we'll try to select one row and see keys, or use the RPC if available.

    // Attempt 1: RPC exec_sql (proven flaky but worth a shot for schema)
    const { data: cols, error: e1 } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public'"
    });

    if (e1) {
        console.log('RPC failed, trying direct select to infer columns...');
        const { data: rows } = await supabase.from('profiles').select('*').limit(1);
        if (rows && rows.length > 0) {
            console.log('Inferred Columns from Row:', Object.keys(rows[0]));
        } else {
            console.log('No rows in profiles to infer columns.');
        }
    } else {
        console.log('Columns:', JSON.stringify(cols, null, 2));
    }

    console.log('\n--- Checking for Teacher/Class Tables ---');
    const { data: tables, error: e2 } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%teacher%'"
    });
    if (e2) console.error('Error checking tables:', e2.message);
    else console.log('Teacher Tables:', JSON.stringify(tables, null, 2));
}

check();
