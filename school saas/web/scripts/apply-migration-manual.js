const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://jggcixrapxccbxckuofw.supabase.co';
// Using key found in existing script
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const migrationFile = path.join(__dirname, '../supabase/migrations/20240210_create_staff_attendance.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

async function apply() {
    console.log('Applying migration...');
    // Try exec_sql first
    const { data: d1, error: e1 } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (e1) {
        console.error('exec_sql failed:', e1.message);
        console.log('Trying execute_sql...');
        // Try execute_sql next
        const { data: d2, error: e2 } = await supabase.rpc('execute_sql', { sql: sql });
        if (e2) {
            console.error('execute_sql failed:', e2.message);
            // Try exec_sql with 'sql' param instead of 'sql_query' as sometimes names differ
            const { data: d3, error: e3 } = await supabase.rpc('exec_sql', { sql: sql });
            if (e3) {
                console.error('exec_sql (alt param) failed:', e3.message);
            } else {
                console.log('Success via exec_sql (alt param)');
            }
        } else {
            console.log('Success via execute_sql');
        }
    } else {
        console.log('Success via exec_sql');
    }
}

apply();
