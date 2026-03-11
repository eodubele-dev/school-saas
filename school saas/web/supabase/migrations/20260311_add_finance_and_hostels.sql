-- Finance & Hostels Schema Update

-- Drop tables if they exist (CASCADE handles policies, triggers, etc. automatically)
-- This ensures a clean slate without errors if relations don't exist.
DROP TABLE IF EXISTS public.fees CASCADE;
DROP TABLE IF EXISTS public.hostel_rooms CASCADE;
DROP TABLE IF EXISTS public.hostels CASCADE;

-- 1. Fees Table
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

-- 2. Hostels Table
create table public.hostels (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  capacity integer not null default 0,
  warden_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Hostel Rooms Table
create table public.hostel_rooms (
  id uuid default gen_random_uuid() primary key,
  hostel_id uuid references public.hostels(id) not null,
  room_number text not null,
  capacity integer not null,
  occupancy integer default 0,
  maintenance_status text check (maintenance_status in ('clean', 'maintenance_needed', 'repair_in_progress')) default 'clean',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Enablement
alter table public.fees enable row level security;
alter table public.hostels enable row level security;
alter table public.hostel_rooms enable row level security;

-- Policies for Fees
create policy "Fees viewable by tenant" on public.fees
  for select using (tenant_id = get_auth_tenant_id());

-- Policies for Hostels
create policy "Hostels viewable by tenant" on public.hostels
  for select using (tenant_id = get_auth_tenant_id());

-- Policies for Hostel Rooms
-- Since hostel_rooms doesn't have a direct tenant_id, we join through the hostels table
create policy "Hostel rooms viewable by tenant" on public.hostel_rooms
  for select using (
    exists (
      select 1 from public.hostels h
      where h.id = hostel_id
      and h.tenant_id = get_auth_tenant_id()
    )
  );
