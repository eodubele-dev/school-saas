
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
    }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraints() {
  const { data, error } = await supabase.rpc('get_table_constraints', { t_name: 'class_levels' });
  
  if (error) {
    // If RPC doesn't exist, try a direct query via a sneaky way if possible or just check the schema file
    console.error('Error fetching constraints via RPC:', error.message);
    
    // Alternative: Try to insert a dummy record and catch the error
    const { error: insertError } = await supabase.from('class_levels').insert({
        name: 'TEST_CHECK',
        section: 'InvalidSection',
        tenant_id: '00000000-0000-0000-0000-000000000000' // dummy
    });
    console.log('Insert error for check:', insertError?.message);
  } else {
    console.log('Constraints:', data);
  }
}

checkConstraints();
