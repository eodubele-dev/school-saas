-- Subjects
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  code text,
  coefficient integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Student Grades
create table public.student_grades (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.students(id) not null,
  subject_id uuid references public.subjects(id) not null,
  class_id uuid references public.classes(id) not null,
  term text not null, -- '1st', '2nd', '3rd'
  session text not null, -- '2023/2024'
  ca1 numeric(5,2) default 0,
  ca2 numeric(5,2) default 0,
  exam numeric(5,2) default 0,
  total numeric(5,2) default 0,
  grade text, -- 'A1', 'B2', etc.
  position integer,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, subject_id, term, session)
);

-- CBT Quizzes
create table public.cbt_quizzes (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  title text not null,
  subject_id uuid references public.subjects(id),
  class_id uuid references public.classes(id),
  teacher_id uuid references public.profiles(id),
  duration_minutes integer default 60,
  total_questions integer default 0,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CBT Questions
create table public.cbt_questions (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.cbt_quizzes(id) on delete cascade not null,
  question_text text not null,
  options jsonb not null, -- Array of strings
  correct_option integer not null, -- Index of correct option
  points integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CBT Attempts
create table public.cbt_attempts (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  quiz_id uuid references public.cbt_quizzes(id) not null,
  student_id uuid references public.students(id) not null,
  score integer default 0,
  total_score integer default 0,
  answers jsonb, -- Map of question_id -> selected_option_index
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subjects enable row level security;
alter table public.student_grades enable row level security;
alter table public.cbt_quizzes enable row level security;
alter table public.cbt_questions enable row level security;
alter table public.cbt_attempts enable row level security;

-- Policies

-- Subjects: Viewable by tenant
create policy "Subjects viewable by tenant" on public.subjects
  for select using (tenant_id = get_auth_tenant_id());

-- Student Grades: Viewable by tenant (teachers/admins), Student can view own
create policy "Grades viewable by tenant" on public.student_grades
  for select using (tenant_id = get_auth_tenant_id());

create policy "Teachers can insert grades" on public.student_grades
  for insert with check (tenant_id = get_auth_tenant_id());

create policy "Teachers can update grades" on public.student_grades
  for update using (tenant_id = get_auth_tenant_id());

-- CBT Quizzes: Viewable by tenant
create policy "Quizzes viewable by tenant" on public.cbt_quizzes
  for select using (tenant_id = get_auth_tenant_id());

create policy "Teachers can manage quizzes" on public.cbt_quizzes
  for all using (tenant_id = get_auth_tenant_id());

-- CBT Questions: Viewable by tenant
create policy "Questions viewable by tenant" on public.cbt_questions
  for select using (
    exists (
      select 1 from public.cbt_quizzes q
      where q.id = quiz_id and q.tenant_id = get_auth_tenant_id()
    )
  );

create policy "Teachers can manage questions" on public.cbt_questions
  for all using (
    exists (
      select 1 from public.cbt_quizzes q
      where q.id = quiz_id and q.tenant_id = get_auth_tenant_id()
    )
  );

-- CBT Attempts: Viewable by tenant
create policy "Attempts viewable by tenant" on public.cbt_attempts
  for select using (tenant_id = get_auth_tenant_id());

create policy "Students can insert attempts" on public.cbt_attempts
  for insert with check (tenant_id = get_auth_tenant_id());

create policy "Students can update own attempts" on public.cbt_attempts
  for update using (student_id = (select id from public.students where parent_id = auth.uid() or id = auth.uid())); -- Simplified for demo
