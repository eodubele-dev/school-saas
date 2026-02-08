/*
  # PLATINUM SUITE SCHEMA UPGRADE
  # --------------------------------------------------------------------------------
  # This migration adds the necessary tables for the "Duty of Care" features:
  # 1. Security: pickup_authorization, gate_passes
  # 2. Health: medical_incidents, student_health_profiles
  # 3. Voice: pta_meetings, feedback_submissions
  # 4. Learning: assignments, curriculum_milestones
*/

-- 🛡️ 1. SECURITY MODULE
create table if not exists pickup_authorization (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) not null,
  name text not null,
  relation text not null,
  photo_url text, -- simplified for demo, normally would match storage
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists gate_passes (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) not null,
  pass_code text not null unique,
  type text check (type in ('early_dismissal', 'late_pickup')),
  reason text,
  valid_until timestamptz not null,
  status text default 'active' check (status in ('active', 'used', 'expired')),
  generated_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 🏥 2. HEALTH MODULE
create table if not exists medical_incidents (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) not null,
  incident_date date not null,
  incident_time time not null,
  type text check (type in ('Injury', 'Illness', 'Routine', 'Emergency')),
  title text not null,
  treatment text,
  nurse_name text,
  status text check (status in ('Back to Class', 'Sent Home', 'Under Observation')),
  created_at timestamptz default now()
);

create table if not exists student_health_alerts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) not null,
  condition text not null, -- e.g. "Peanut Allergy"
  severity text check (severity in ('Mild', 'Moderate', 'Severe', 'Critical')),
  notes text,
  verified_at timestamptz, -- if null, unverified
  created_at timestamptz default now()
);

-- 🗣️ 3. VOICE & FEEDBACK MODULE
create table if not exists pta_meetings (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references auth.users(id) not null,
  teacher_id uuid references profiles(id), -- links to profile with teacher role
  student_id uuid references students(id),
  scheduled_at timestamptz not null,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  meeting_link text,
  created_at timestamptz default now()
);

create table if not exists feedback_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- optional, can be anon
  category text not null, -- e.g. 'Academic', 'Facility', 'Event'
  rating integer check (rating between 1 and 5),
  message text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'actioned')),
  created_at timestamptz default now()
);

-- 📚 4. LEARNING MODULE (Simplified for MVP)
create table if not exists personal_assignments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) not null,
  subject text not null,
  title text not null,
  due_date date not null,
  priority text check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'submitted', 'graded', 'late')),
  score numeric,
  created_at timestamptz default now()
);

create table if not exists curriculum_milestones (
  id uuid default gen_random_uuid() primary key,
  term_id uuid, -- optional linkage
  subject text not null,
  grade_level text not null,
  topic text not null,
  week_range text, -- e.g. 'Week 1-2'
  status text default 'locked' check (status in ('locked', 'in-progress', 'completed')),
  progress_percent integer default 0,
  student_id uuid references students(id), -- De-normalized for per-student tracking in MVP
  created_at timestamptz default now()
);

-- 🔒 RLS POLICIES (Simplified: Parents can read their own kids' data)

alter table pickup_authorization enable row level security;
alter table gate_passes enable row level security;
alter table medical_incidents enable row level security;
alter table student_health_alerts enable row level security;
alter table pta_meetings enable row level security;
alter table feedback_submissions enable row level security;
alter table personal_assignments enable row level security;
alter table curriculum_milestones enable row level security;

-- GENERIC READ POLICIES

-- POLICY: pickup_authorization
create policy "Parents can view their student's pickup list" on pickup_authorization
  for select using (
    exists (
      select 1 from students s
      where s.id = pickup_authorization.student_id 
      and s.parent_id = auth.uid()
    )
  );
  
create policy "Parents can add pickup persons" on pickup_authorization
  for insert with check (
    exists (
      select 1 from students s
      where s.id = pickup_authorization.student_id 
      and s.parent_id = auth.uid()
    )
  );

-- POLICY: personal_assignments
create policy "Parents can view personal assignments" on personal_assignments
  for select using (
    exists (
      select 1 from students s
      where s.id = personal_assignments.student_id 
      and s.parent_id = auth.uid()
    )
  );

-- (Implicitly assuming similar policies would be created for other tables in a real app, 
-- but ensuring at least the tables exist and RLS is on for safety)

-- 🛠️ SEED DATA (For Immediate Verification)
DO $$
DECLARE
  v_student_id uuid;
  v_parent_id uuid;
BEGIN
  -- Attempt to find a student to seed data for (just for testing)
  select id into v_student_id from students limit 1;
  
  IF v_student_id IS NOT NULL THEN
    -- Seed Medical Log
    insert into medical_incidents (student_id, incident_date, incident_time, type, title, treatment, nurse_name, status)
    values 
    (v_student_id, '2025-10-24', '10:15', 'Injury', 'Minor Scrape (Playground)', 'Cleaned and plastered', 'Nurse Sarah', 'Back to Class');

    -- Seed Allergy
    insert into student_health_alerts (student_id, condition, severity, notes, verified_at)
    values
    (v_student_id, 'Peanut Allergy', 'Severe', 'EpiPen required immediately.', now());
    
    -- Seed Assignment
    insert into personal_assignments (student_id, subject, title, due_date, priority, status)
    values
    (v_student_id, 'Mathematics', 'Quadratic Graphs Worksheet', (now() + interval '1 day')::date, 'high', 'pending');
    
  END IF;
END $$;
