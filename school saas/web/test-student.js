const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const parentId = '9ecae254-e89a-40d0-8905-d5129d182f01';
    const emmanuelId = '460e6548-98a9-4a60-a242-3d767cad108b';

    await supabase.from('students').update({ parent_id: parentId }).eq('id', emmanuelId);
    console.log("Linked Emmanuel Odubele to the parent!");
}
test();
