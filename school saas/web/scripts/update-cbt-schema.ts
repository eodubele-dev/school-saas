import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateSchema() {
    const sql = `
        ALTER TABLE public.past_questions ALTER COLUMN tenant_id DROP NOT NULL;
        DROP POLICY IF EXISTS "Past questions viewable by tenant" ON public.past_questions;
        CREATE POLICY "Past questions viewable by all" ON public.past_questions 
        FOR SELECT USING (tenant_id IS NULL OR tenant_id = (select tenant_id from public.profiles where id = auth.uid()));
    `
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql })
    if (error) console.error("Schema Update Error:", error)
    else console.log("Successfully updated schema for Global Questions.")
}

updateSchema()
