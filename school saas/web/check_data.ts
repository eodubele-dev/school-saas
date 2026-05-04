import { config } from 'dotenv';
config({ path: '.env.local' });
import { createAdminClient } from './lib/supabase/admin';

async function checkData() {
    const supabase = createAdminClient();
    
    // Check last 3 students
    const { data: students } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
    
    console.log('--- LATEST STUDENTS ---');
    console.log(students);

    // Check last 3 parent profiles
    const { data: parents } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'parent')
        .order('created_at', { ascending: false })
        .limit(3);
    
    console.log('--- LATEST PARENTS ---');
    console.log(parents);
}

checkData();
