import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function run() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }

    // Check if URL ends with ?sslmode=disable, otherwise it might fail localhost self-signed

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to DB.");

        await client.query(`
            ALTER TABLE public.tenants 
            ADD COLUMN IF NOT EXISTS sms_balance DECIMAL(12,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS pilot_ends_at TIMESTAMP WITH TIME ZONE;
        `);
        console.log("Added sms_balance and pilot_ends_at to tenants");

    } catch (e) {
        console.error("Failed", e);
    } finally {
        await client.end();
    }
}

run();
