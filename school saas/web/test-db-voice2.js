const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    async function test() {
        try {
            const feed = await supabase.from('feedback_submissions').select('*').limit(1);
            console.log("Feedback row:", feed.data);

            const mtg = await supabase.from('pta_meetings').select('*').limit(1);
            console.log("PTA Meetings row:", mtg.data);

            const slots = await supabase.from('pta_slots').select('*').limit(1);
            console.log("PTA Slots row:", slots.data);
        } catch (e) {
            console.error("Fetch error:", e);
        }
    }
    test().then(() => console.log('Done'));
} catch (e) {
    console.error("Init Error:", e);
}
