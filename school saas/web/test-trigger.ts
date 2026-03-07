import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

async function check() {
    console.log("Testing Invoice Update...");
    const { data: invData, error: invError } = await supabase.from('invoices').update({ amount_paid: 10 }).eq('id', 'test').select();
    console.log('Invoice Update Error:', invError?.message);

    console.log("Testing Transaction Insert...");
    const { data: trxData, error: trxError } = await supabase.from('transactions').insert({
        tenant_id: 'eodubele-dev',
        invoice_id: 'b6224e75-3ad0-4b2a-b924-a2b16ec22cf2',
        student_id: '80dfb1cd-698f-4d37-af2e-4361099e0ff9',
        amount: 10,
        method: 'cash'
    }).select();
    console.log('Transaction Insert Error:', trxError?.message);
}

check();
