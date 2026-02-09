const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});

async function run() {
    await pool.connect();

    const sqlPath = path.join(__dirname, '../supabase/complete_assignment_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration...');
    try {
        const res = await client.query(sql);
        console.log('Migration successful:', res);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
