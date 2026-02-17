-- Migration: Add Student Progress Tracking Tables
-- Created: 2026-01-28
-- Description: Adds tables for tracking student progress, lessons, and daily activities

-- Lessons table: Stores curriculum lessons for each subject and grade
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  subject text not null check (subject in ('Math', 'Reading', 'Science', 'Writing', 'Social Studies')),
  grade_level text not null,
  title text not null,
  description text,
  topics text[], -- Array of topics covered in this lesson
  order_index integer not null default 0, -- Order within the subject/grade
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Student Progress table: Tracks overall progress per subject for each student
create table public.student_progress (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.students(id) on delete cascade not null,
  subject text not null check (subject in ('Math', 'Reading', 'Science', 'Writing', 'Social Studies')),
  grade_level text not null,
  completed_lessons integer default 0,
  total_lessons integer default 0,
  progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  next_lesson_title text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, subject, grade_level)
);

-- Student Activities table: Tracks daily lesson completions and study time
create table public.student_activities (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.students(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete set null,
  subject text not null check (subject in ('Math', 'Reading', 'Science', 'Writing', 'Social Studies')),
  lesson_number integer not null,
  title text not null,
  status text not null check (status in ('completed', 'not_started', 'in_progress')) default 'not_started',
  duration_minutes integer default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.lessons enable row level security;
alter table public.student_progress enable row level security;
alter table public.student_activities enable row level security;

-- RLS Policies for lessons
create policy "Lessons viewable by tenant" on public.lessons
  for select using (tenant_id = get_auth_tenant_id());

create policy "Lessons insertable by tenant admins/teachers" on public.lessons
  for insert with check (tenant_id = get_auth_tenant_id());

create policy "Lessons updatable by tenant admins/teachers" on public.lessons
  for update using (tenant_id = get_auth_tenant_id());

-- RLS Policies for student_progress
create policy "Student progress viewable by tenant" on public.student_progress
  for select using (tenant_id = get_auth_tenant_id());

create policy "Student progress insertable by tenant" on public.student_progress
  for insert with check (tenant_id = get_auth_tenant_id());

create policy "Student progress updatable by tenant" on public.student_progress
  for update using (tenant_id = get_auth_tenant_id());

-- RLS Policies for student_activities
create policy "Student activities viewable by tenant" on public.student_activities
  for select using (tenant_id = get_auth_tenant_id());

create policy "Student activities insertable by tenant" on public.student_activities
  for insert with check (tenant_id = get_auth_tenant_id());

create policy "Student activities updatable by tenant" on public.student_activities
  for update using (tenant_id = get_auth_tenant_id());

-- Create indexes for better query performance
create index idx_lessons_tenant_subject on public.lessons(tenant_id, subject, grade_level);
create index idx_student_progress_student on public.student_progress(student_id);
create index idx_student_activities_student on public.student_activities(student_id, created_at desc);
create index idx_student_activities_date on public.student_activities(student_id, completed_at);

-- FIX: Add missing status column to cbt_attempts
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'status') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN status text NOT NULL DEFAULT 'in_progress';
    END IF;
END $$;
