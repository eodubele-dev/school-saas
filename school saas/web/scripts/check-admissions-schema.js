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

        console.log('--- Students Table Schema ---');
        // We can't query information_schema directly easily via js client sometimes if not exposed, 
        // but we can try to select one row to seeing structure or use rpc if available. 
        // Better: Query information_schema via a raw SQL query using the debug endpoint logic, 
        // OR just try to select * limit 1 to infer keys.
        // Let's use the debug endpoint logic but wrapped in this node script for reliability.

        // Actually, since we have the service key, we can use the debug endpoint via fetch from this script
        // to avoid shell escaping issues.

        const query = `
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('students', 'parents', 'class_arms', 'houses')
            ORDER BY table_name, ordinal_position;
        `;

        // Using the debug endpoint from within Node
        const debugUrl = 'http://localhost:3000/api/debug-kv';
        const response = await fetch(debugUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error('Schema check failed:', err);
    }
}

run();
