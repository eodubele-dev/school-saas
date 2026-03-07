import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string);

async function check() {
    console.log("Fetching an Invoice to Test Update...");
    const { data: invData } = await supabase.from('invoices').select('id, amount, amount_paid, status').limit(1).single();

    if (invData) {
        console.log('Testing raw update on Invoice:', invData.id);
        const { data: updateData, error: updateError } = await supabase.from('invoices')
            .update({ amount_paid: 100 })
            .eq('id', invData.id)
            .select();

        console.log('Update Error:', updateError);
        console.log('Update Result:', updateData);
    }
}

check();
