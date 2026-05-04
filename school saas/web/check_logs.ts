import { config } from 'dotenv';
config({ path: '.env.local' });
import { createAdminClient } from './lib/supabase/admin';

async function checkSmsLogs() {
    const supabase = createAdminClient();
    
    // Check last 3 message logs
    const { data: logs, error } = await supabase
        .from('message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
    
    if (error) console.error('Error fetching logs:', error);
    else {
        console.log('--- LATEST MESSAGE LOGS ---');
        logs?.forEach(log => {
            console.log(`To: ${log.recipient_phone} | Status: ${log.status} | Cost: ${log.cost} | Channel: ${log.channel}`);
            console.log(`Content: ${log.message_content.substring(0, 50)}...`);
            console.log('---------------------------');
        });
    }
}

checkSmsLogs();
