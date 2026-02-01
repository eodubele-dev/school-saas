-- Staff Attendance & Leave Management Schema

-- 1. Leave Requests Table
create table if not exists public.staff_leave_requests (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    staff_id uuid references public.profiles(id) not null,
    start_date date not null,
    end_date date not null,
    leave_type text check (leave_type in ('sick', 'casual', 'maternity', 'study', 'other')) not null,
    reason text,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    approved_by uuid references public.profiles(id),
    rejection_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Biometric Logs Table (Raw API Data)
create table if not exists public.biometric_logs (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    device_id text not null,
    biometric_staff_id text not null, -- ID on the machine
    matched_staff_id uuid references public.profiles(id), -- Linked internal ID
    timestamp timestamp with time zone not null,
    scan_type text check (scan_type in ('check_in', 'check_out')) default 'check_in',
    raw_data jsonb, -- Any extra payload
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Add biometric mapping to profiles
alter table public.profiles add column if not exists biometric_id text; -- ID on the ZKTeco device

-- RLS Policies
alter table public.staff_leave_requests enable row level security;
alter table public.biometric_logs enable row level security;

-- Policies for Leave Requests
create policy "Staff can view own leave requests" on public.staff_leave_requests
    for select using (auth.uid() = staff_id);

create policy "Staff can create leave requests" on public.staff_leave_requests
    for insert with check (auth.uid() = staff_id);

create policy "Admins can view all leave requests" on public.staff_leave_requests
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal') and tenant_id = staff_leave_requests.tenant_id
        )
    );

create policy "Admins can update leave requests" on public.staff_leave_requests
    for update using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal') and tenant_id = staff_leave_requests.tenant_id
        )
    );

-- Policies for Biometric Logs
-- Usually these are inserted via Service Role API, but admins might want to view log
create policy "Admins can view biometric logs" on public.biometric_logs
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal') and tenant_id = biometric_logs.tenant_id
        )
    );
