-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants (Schools)
create table public.tenants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  domain text,
  logo_url text,
  theme_config jsonb default '{"primary": "#2563eb", "accent": "#0ea5e9"}'::jsonb
);

-- Create profiles table (extends auth.users)
-- Note: auth.users is managed by Supabase. We link to it via ID.
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  tenant_id uuid references public.tenants(id),
  full_name text,
  role text check (role in ('admin', 'teacher', 'parent', 'student')) default 'parent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Classes
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  grade_level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Students
create table public.students (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  full_name text not null,
  parent_id uuid references public.profiles(id),
  class_id uuid references public.classes(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lesson Plans
create table public.lesson_plans (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  class_id uuid references public.classes(id),
  teacher_id uuid references public.profiles(id),
  title text not null,
  content text,
  subject text,
  date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Staff Attendance
create table public.staff_attendance (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  staff_id uuid references public.profiles(id) not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late', 'excused')) default 'present',
  check_in_time time,
  check_out_time time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.lesson_plans enable row level security;
alter table public.staff_attendance enable row level security;

-- Policies

-- Tenants: Public read for subdomain resolution (or restrict to authenticated later)
create policy "Tenants are viewable by everyone" on public.tenants for select using (true);

-- Functions to get current user tenant
create or replace function get_auth_tenant_id()
returns uuid as $$
  select tenant_id from public.profiles where id = auth.uid();
$$ language sql security definer;

-- Profiles: Viewable if in same tenant
create policy "Profiles viewable by same tenant" on public.profiles
  for select using (tenant_id = get_auth_tenant_id());

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Classes: Viewable by tenant members
create policy "Classes viewable by tenant" on public.classes
  for select using (tenant_id = get_auth_tenant_id());

-- Students: Viewable by tenant members
create policy "Students viewable by tenant" on public.students
  for select using (tenant_id = get_auth_tenant_id());

-- Lesson Plans: Viewable by tenant members
create policy "Lesson plans viewable by tenant" on public.lesson_plans
  for select using (tenant_id = get_auth_tenant_id());

-- Staff Attendance: Viewable by tenant members
create policy "Staff attendance viewable by tenant" on public.staff_attendance
  for select using (tenant_id = get_auth_tenant_id());
