
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    const { data, error } = await supabase.from('inventory_items').select('count', { count: 'exact', head: true });
    if (error) {
        console.log('Error accessing inventory_items (likely does not exist):', error.message);
    } else {
        console.log('inventory_items table exists.');
    }
}

checkTable();
