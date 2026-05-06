
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

async function findTenantAndAdd() {
  const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
  if (!tenant) {
      console.log("No tenants found");
      return;
  }
  console.log("Using tenant:", tenant.id);

  const { data, error } = await supabase
    .from('class_levels')
    .insert({
        name: 'JSS 2',
        section: 'Junior',
        tenant_id: tenant.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success:', data);
  }
}

findTenantAndAdd();
