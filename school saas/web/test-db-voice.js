const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    async function test() {
        try {
            console.log("Testing feedback_submissions...");
            const feed = await supabase.from('feedback_submissions').select('id').limit(1);
            console.log("Feedback error:", feed.error ? feed.error.message : "Table exists");

            console.log("Testing pta_meetings...");
            const mtg = await supabase.from('pta_meetings').select('id').limit(1);
            console.log("PTA Meetings error:", mtg.error ? mtg.error.message : "Table exists");

            console.log("Testing pta_slots...");
            const slots = await supabase.from('pta_slots').select('id').limit(1);
            console.log("PTA Slots error:", slots.error ? slots.error.message : "Table exists");
        } catch (e) {
            console.error("Fetch error:", e);
        }
    }
    test().then(() => console.log('Done'));
} catch (e) {
    console.error("Init Error:", e);
}
