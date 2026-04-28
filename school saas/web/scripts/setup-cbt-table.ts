import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTable() {
    const sql = `
    -- Table for Student Independent Practice Sessions
    create table if not exists public.practice_sessions (
      id uuid default gen_random_uuid() primary key,
      tenant_id uuid references public.tenants(id) not null,
      student_id uuid references public.profiles(id) not null,
      subject text not null,
      exam_type text not null,
      year integer not null,
      score integer default 0,
      total_questions integer default 0,
      status text default 'in_progress',
      answers jsonb default '[]'::jsonb,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    -- RLS
    alter table public.practice_sessions enable row level security;

    -- Cleanup existing policies to avoid errors on rerun
    drop policy if exists "Users can view own practice sessions" on public.practice_sessions;
    drop policy if exists "Staff can view tenant practice sessions" on public.practice_sessions;
    drop policy if exists "Students can insert own practice sessions" on public.practice_sessions;
    drop policy if exists "Students can update own practice sessions" on public.practice_sessions;

    -- Viewable by student and staff
    create policy "Users can view own practice sessions" on public.practice_sessions
      for select using (student_id = auth.uid());

    create policy "Staff can view tenant practice sessions" on public.practice_sessions
      for select using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));

    -- Students can manage their own sessions
    create policy "Students can insert own practice sessions" on public.practice_sessions
      for insert with check (student_id = auth.uid());

    create policy "Students can update own practice sessions" on public.practice_sessions
      for update using (student_id = auth.uid());
    `

    const { error } = await supabase.rpc('execute_sql', { sql_query: sql })
    if (error) {
        console.error("Error creating table via RPC:", error)
        // If RPC fails (not enabled), we can't do much here.
        // But usually I can try to run it via the Postgres extension if enabled.
    } else {
        console.log("Successfully ran SQL via RPC.")
    }
}

createTable()
