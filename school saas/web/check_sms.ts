import { config } from 'dotenv';
config({ path: '.env.local' });
import { createAdminClient } from './lib/supabase/admin';

async function checkSmsStatus() {
    const supabase = createAdminClient();
    
    // Check tenants
    const { data: tenants, error: tError } = await supabase.from('tenants').select('id, name, sms_balance');
    if (tError) console.error('Tenant error:', tError);
    else console.log('Tenants:', tenants);

    // Check message_logs for the specific email/phone if possible, or just last 5
    const { data: logs, error: lError } = await supabase
        .from('message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (lError) console.error('Logs error:', lError);
    else console.log('Last 5 Message Logs:', logs);
}

checkSmsStatus();
