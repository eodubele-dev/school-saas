require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

const payload = {
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 3600,
  sub: 'e5d1b940-d7a4-4033-bac8-6dafaadc7923',
  email: 'achievingminds2018@gmail.com',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  role: 'authenticated'
};

const token = jwt.sign(payload, jwtSecret);

const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        headers: {
            Authorization: 'Bearer ' + token
        }
    }
});

async function test() {
    const { data, error } = await supabase.from('fee_categories').select('*');
    console.log('User fetch:', data, error);
}
test();
