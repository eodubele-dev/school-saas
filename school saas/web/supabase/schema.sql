-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants (Schools)
create table if not exists public.tenants (
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
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  tenant_id uuid references public.tenants(id),
  full_name text,
  role text check (role in ('admin', 'teacher', 'parent', 'student', 'bursar', 'registrar', 'owner', 'manager')) default 'parent',
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

-- Fees
create table public.fees (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.students(id) not null,
  amount numeric(10, 2) not null,
  status text check (status in ('paid', 'unpaid', 'partial', 'cancelled')) default 'unpaid',
  due_date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hostels
create table public.hostels (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  capacity integer not null default 0,
  warden_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hostel Rooms
create table public.hostel_rooms (
  id uuid default gen_random_uuid() primary key,
  hostel_id uuid references public.hostels(id) not null,
  room_number text not null,
  capacity integer not null,
  occupancy integer default 0,
  maintenance_status text check (maintenance_status in ('clean', 'maintenance_needed', 'repair_in_progress')) default 'clean',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fees enable row level security;
alter table public.hostels enable row level security;
alter table public.hostel_rooms enable row level security;

create policy "Fees viewable by tenant" on public.fees
  for select using (tenant_id = get_auth_tenant_id());

create policy "Hostels viewable by tenant" on public.hostels
  for select using (tenant_id = get_auth_tenant_id());

create policy "Hostel rooms viewable by tenant" on public.hostel_rooms
  for select using (
    exists (
      select 1 from public.hostels h
      where h.id = hostel_id
      and h.tenant_id = get_auth_tenant_id()
    )
  );

-- User Preferences Table
create table if not exists public.user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null unique,
    theme text default 'system',
    language text default 'en-NG',
    font_size integer default 100,
    hide_financial_figures boolean default false,
    notifications jsonb default '{"in_app":{"security":true,"academic":true,"financial":true,"emergency":true},"email":{"security":true,"academic":true,"financial":true,"emergency":true},"sms":{"security":false,"academic":false,"financial":false,"emergency":true}}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
create policy "Users can view own preferences" 
    on public.user_preferences for select 
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences" 
    on public.user_preferences for insert 
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences" 
    on public.user_preferences for update 
    using (auth.uid() = user_id);
