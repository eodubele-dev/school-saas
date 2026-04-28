-- Table for Student Independent Practice Sessions
create table public.practice_sessions (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.profiles(id) not null,
  subject text not null,
  exam_type text not null,
  year integer not null,
  score integer default 0,
  total_questions integer default 0,
  status text default 'in_progress', -- 'in_progress', 'completed'
  answers jsonb default '[]'::jsonb, -- Store student answers for review
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.practice_sessions enable row level security;

-- Viewable by student and staff
create policy "Users can view own practice sessions" on public.practice_sessions
  for select using (student_id = auth.uid());

create policy "Staff can view tenant practice sessions" on public.practice_sessions
  for select using (tenant_id = get_auth_tenant_id());

-- Students can manage their own sessions
create policy "Students can insert own practice sessions" on public.practice_sessions
  for insert with check (student_id = auth.uid());

create policy "Students can update own practice sessions" on public.practice_sessions
  for update using (student_id = auth.uid());
