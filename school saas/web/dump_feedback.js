const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

supabase.from('feedback_submissions').select('*').then(({ data, error }) => {
    fs.writeFileSync('feedback_data.json', JSON.stringify({ error, data }, null, 2));
    console.log('Wrote to feedback_data.json');
});
