const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});

async function checkFunction() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT pg_get_functiondef('public.get_auth_tenant_id()'::regprocedure);");
        console.log('Function Definition:');
        console.log(res.rows[0].pg_get_functiondef);
    } catch (err) {
        console.error('Failed to get function definition:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

checkFunction();
