
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkTenant() {
    const slug = 'ristmas';
    console.log(`Checking for tenant with slug: ${slug}`);
    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error("Error fetching tenant:", error.message);
        return;
    }

    if (!tenant) {
        console.log(`No tenant found with slug: ${slug}`);
    } else {
        console.log("Tenant found:", JSON.stringify(tenant, null, 2));
    }
}

checkTenant();
