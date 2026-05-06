
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

async function testJoin() {
  const { data, error } = await supabase
    .from('timetables')
    .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        subject:subjects(id, name),
        class:classes(id, name),
        teacher:profiles(id, full_name)
    `);
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Joined records:', data.length);
    if (data.length > 0) {
        console.log('First joined record:', JSON.stringify(data[0], null, 2));
    }
  }
}

testJoin();
