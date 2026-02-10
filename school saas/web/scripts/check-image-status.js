const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient('https://jggcixrapxccbxckuofw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU');

function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode);
        }).on('error', (err) => {
            resolve('ERROR: ' + err.message);
        });
    });
}

async function run() {
    const { data: tenants } = await supabase.from('tenants').select('name, logo_url');
    const { data: profiles } = await supabase.from('profiles').select('full_name, avatar_url');

    console.log('--- Checking Tenant Logos ---');
    for (const t of tenants) {
        if (t.logo_url) {
            const status = await checkUrl(t.logo_url);
            console.log(`${t.name}: ${t.logo_url} -> ${status}`);
        }
    }

    console.log('\n--- Checking Profile Avatars ---');
    for (const p of profiles) {
        if (p.avatar_url) {
            const status = await checkUrl(p.avatar_url);
            console.log(`${p.full_name}: ${p.avatar_url} -> ${status}`);
        }
    }
}

run();
