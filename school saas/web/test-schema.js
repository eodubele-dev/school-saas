const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    async function test() {
        const { data: mtg } = await supabase.from('pta_meetings').select('*').limit(1);
        console.log("PTA Meetings Columns:", mtg && mtg.length > 0 ? Object.keys(mtg[0]) : "Empty table");

        const { data: feed } = await supabase.from('feedback_submissions').select('*').limit(1);
        console.log("Feedback Columns:", feed && feed.length > 0 ? Object.keys(feed[0]) : "Empty table");
    }
    test().then(() => console.log('Done'));
} catch (e) {
    console.error("Init Error:", e);
}
