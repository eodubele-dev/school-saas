
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("Checking 'tenants' table columns...");
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'tenants' });
    
    if (error) {
        // Fallback: Just select one row and look at keys
        console.log("RPC failed, fetching one row instead...");
        const { data: row, error: rowError } = await supabase.from('tenants').select('*').limit(1).single();
        if (rowError) {
            console.error("Error:", rowError.message);
            return;
        }
        console.log("Columns found:", Object.keys(row).join(', '));
        return;
    }
    console.log("Columns:", data.map(c => c.column_name).join(', '));
}

checkSchema();
