const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jggcixrapxccbxckuofw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const sql = `
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS genotype text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS passport_url text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS house text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_number text;

-- Ensure index/unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_admission_number_key') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_admission_number_key UNIQUE (admission_number);
    END IF;
END $$;
`;

// Try to use exec_sql RPC
async function fix() {
    console.log('Attempting to fix schema via rpc...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('RPC Error:', error);
        console.log('Trying alternative rpc name...');
        const { data: data2, error: error2 } = await supabase.rpc('execute_sql', { sql: sql });
        if (error2) console.error('RPC Alternative Error:', error2);
        else console.log('Successfully fixed via execute_sql');
    } else {
        console.log('Successfully fixed via exec_sql');
    }
}

fix();
