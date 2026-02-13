const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});

async function run() {
    const client = await pool.connect();

    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Please provide a SQL file path.');
        process.exit(1);
    }

    const sqlPath = path.resolve(process.cwd(), sqlFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`Running migration from ${sqlFile}...`);
    try {
        const res = await client.query(sql);
        console.log('Migration successful:', res);
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
