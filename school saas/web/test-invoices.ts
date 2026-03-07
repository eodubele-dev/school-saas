import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

async function check() {
    console.log("Fetching Invoices Data...");
    const { data: invData, error: invError } = await supabase.from('invoices').select('id, amount, amount_paid, status');
    console.log('Invoices Data:', JSON.stringify(invData, null, 2));

    console.log("Fetching Transactions...");
    const { data: trxData, error: trxError } = await supabase.from('transactions').select('id, amount, is_reconciled');
    console.log('Transactions:', JSON.stringify(trxData, null, 2));
}

check();
