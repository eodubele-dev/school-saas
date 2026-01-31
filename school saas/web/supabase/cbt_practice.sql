-- Past Questions for CBT Practice
create table public.past_questions (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  subject text not null, -- e.g. 'Mathematics'
  exam_type text not null, -- e.g. 'WAEC', 'JAMB'
  year integer not null, -- e.g. 2023
  question_text text not null,
  options jsonb not null, -- Array of strings ["A", "B", "C", "D"]
  correct_option integer not null, -- Index 0-3
  explanation text, -- Why the answer is right
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.past_questions enable row level security;

-- Viewable by everyone in the tenant (students need to practice)
create policy "Past questions viewable by tenant" on public.past_questions
  for select using (tenant_id = get_auth_tenant_id());

-- Only Teachers/Admins can insert (managed via upload tool)
create policy "Teachers can insert past questions" on public.past_questions
  for insert with check (tenant_id = get_auth_tenant_id());
