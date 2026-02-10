const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('https://jggcixrapxccbxckuofw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU');

async function debug() {
    const { data: tenants } = await supabase.from('tenants').select('*');
    const { data: profiles } = await supabase.from('profiles').select('*');

    const output = {
        tenants,
        profilesWithAvatars: profiles.filter(p => p.avatar_url)
    };

    fs.writeFileSync('image_debug.json', JSON.stringify(output, null, 2));
    console.log('Wrote debug info to image_debug.json');
}

debug();
