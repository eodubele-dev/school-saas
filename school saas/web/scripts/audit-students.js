const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggcixrapxccbxckuofw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function check() {
    console.log('--- Students Table Columns ---');
    const { data: cols, error: colError } = await supabase.from('students').select('*').limit(0);
    // Since we want schema details, we can use a query if exec_sql works
    // But let's just try to insert a dummy one to see the error if it fails

    const { data: q1, error: e1 } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'students' AND table_schema = 'public'"
    });
    if (e1) console.error('Error fetching columns:', e1);
    else console.log('Columns:', JSON.stringify(q1, null, 2));

    console.log('\n--- Students Table Triggers ---');
    const { data: q2, error: e2 } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'students'"
    });
    if (e2) console.error('Error fetching triggers:', e2);
    else console.log('Triggers:', JSON.stringify(q2, null, 2));

    console.log('\n--- Students Table Policies ---');
    const { data: q3, error: e3 } = await supabase.rpc('exec_sql', {
        sql_query: "SELECT * FROM pg_policies WHERE tablename = 'students'"
    });
    if (e3) console.error('Error fetching policies:', e3);
    else console.log('Policies:', JSON.stringify(q3, null, 2));

    console.log('\n--- Profiles Table (Admin) ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').eq('role', 'admin');
    if (pError) console.error('Error fetching admin profiles:', pError);
    else console.log('Admin Profiles:', JSON.stringify(profiles, null, 2));
}

check();
