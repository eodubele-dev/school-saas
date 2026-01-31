const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const envPath = path.join(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');

        const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\s]+)/);
        const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s]+)/);

        if (!urlMatch || !keyMatch) {
            throw new Error('Missing Supabase variables in .env.local');
        }

        const supabase = createClient(urlMatch[1], keyMatch[1]);

        console.log('Ensuring school-assets bucket exists...');
        const { data, error } = await supabase.storage.createBucket('school-assets', {
            public: true
        });

        if (error && error.message !== 'Already exists') {
            console.error('Error:', error.message);
        } else {
            console.log('Bucket school-assets ensured successfully.');
        }
    } catch (err) {
        console.error('Setup failed:', err.message);
    }
}

run();
