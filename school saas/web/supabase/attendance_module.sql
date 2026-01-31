-- Attendance Module

-- Daily Registers (Linked to Class usually)
create table public.attendance_registers (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  class_id uuid references public.classes(id) not null,
  date date default CURRENT_DATE not null,
  marked_by uuid references public.profiles(id), -- Teacher who marked it
  
  -- Metadata for Geofencing verification
  marked_at_latitude double precision,
  marked_at_longitude double precision,
  is_within_geofence boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, date)
);

-- Individual Student Attendance Records
create table public.student_attendance (
  id uuid default gen_random_uuid() primary key,
  register_id uuid references public.attendance_registers(id) on delete cascade not null,
  student_id uuid references public.students(id) not null,
  status text check (status in ('present', 'absent', 'late', 'excused')) default 'present',
  remarks text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Store School Geofence in tenants config (or add specific columns)
-- Adding columns to tenants table for simpler access
alter table public.tenants add column if not exists geofence_lat double precision;
alter table public.tenants add column if not exists geofence_lng double precision;
alter table public.tenants add column if not exists geofence_radius_meters integer default 500;

-- RLS
alter table public.attendance_registers enable row level security;
alter table public.student_attendance enable row level security;

-- Policies
create policy "Registers viewable by tenant" on public.attendance_registers
  for select using (tenant_id = get_auth_tenant_id());

create policy "Teachers can mark registers" on public.attendance_registers
  for insert with check (tenant_id = get_auth_tenant_id());
  
create policy "Attendance viewable by tenant" on public.student_attendance
  for select using (
    exists (
      select 1 from public.attendance_registers r
      where r.id = register_id and r.tenant_id = get_auth_tenant_id()
    )
  );

create policy "Teachers can mark student attendance" on public.student_attendance
  for insert with check (
    exists (
      select 1 from public.attendance_registers r
      where r.id = register_id and r.tenant_id = get_auth_tenant_id()
    )
  );
