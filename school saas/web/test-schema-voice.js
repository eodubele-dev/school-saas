const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    // 1. Check feedback_submissions
    const { data: feedData, error: feedErr } = await supabase.from('feedback_submissions').select('*').limit(1);
    console.log("feedback_submissions count", feedData?.length);
    if (feedErr) console.log("feedback_submissions Error", feedErr);

    // Test insert mock feedback to see what fails or succeeds to infer columns
    const { error: feedInsertErr } = await supabase.from('feedback_submissions').insert([{
        category: 'Test', rating: 5, message: 'Test message'
    }]);
    console.log("try feedback_insert", feedInsertErr || 'Success');

    // 2. Check pta_meetings
    const { error: ptaInsertErr } = await supabase.from('pta_meetings').insert([{
        student_id: '460e6548-98a9-4a60-a242-3d767cad108b',
        scheduled_at: new Date().toISOString(),
        status: 'scheduled'
    }]);
    console.log("try pta_meetings_insert", ptaInsertErr || 'Success');
}

test().then(() => console.log('Done'));
