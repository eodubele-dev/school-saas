import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Function to fetch raw SQL via RPC or just hardcode the check
async function check() {
    // If we can't run raw SQL easily via client, we fetch the table via REST to see its shape
    const res = await fetch(`${supabaseUrl}/rest/v1/invoices?limit=1`, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    console.log("Invoices Shape:", await res.json());
}

check();
