
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTenants() {
    console.log("Searching for tenants...");
    const { data, error } = await supabase
        .from('tenants')
        .select('name, slug')
        .or('slug.ilike.%onon%,name.ilike.%onon%');

    if (error) {
        console.error("Error fetching tenants:", error);
        return;
    }

    if (data.length === 0) {
        console.log("No tenants found matching 'onon'.");
        
        // Let's see some recent tenants
        const { data: recent } = await supabase
            .from('tenants')
            .select('name, slug')
            .order('created_at', { ascending: false })
            .limit(10);
        
        console.log("Recent tenants:", recent);
    } else {
        console.log("Found matching tenants:", data);
    }
}

checkTenants();
