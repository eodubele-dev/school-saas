
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

async function testJunior() {
  const { error: insertError } = await supabase.from('class_levels').insert({
      name: 'TEST_JUNIOR',
      section: 'Junior',
      tenant_id: '8670562e-503d-495f-9721-a4773d191254' // Use a valid tenant ID if possible, or just see if it hits check constraint
  });
  console.log('Insert error for Junior:', insertError?.message);
}

testJunior();
