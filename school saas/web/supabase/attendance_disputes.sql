-- Attendance Dispute Workflow Table
create table public.staff_attendance_disputes (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    staff_id uuid references public.profiles(id) not null,
    audit_log_id uuid, -- Reference to the failed audit log attempt
    distance_detected numeric not null,
    reason text not null,
    proof_url text, -- URL to uploaded image/video (mocked for now)
    status text check (status in ('pending', 'approved', 'declined')) default 'pending',
    resolved_by uuid references public.profiles(id),
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.staff_attendance_disputes enable row level security;

-- Policies
create policy "Disputes viewable by tenant" on public.staff_attendance_disputes
    for select using (tenant_id = get_auth_tenant_id());

create policy "Staff can create disputes" on public.staff_attendance_disputes
    for insert with check (tenant_id = get_auth_tenant_id() and staff_id = auth.uid());

create policy "Admins can update disputes" on public.staff_attendance_disputes
    for update using (tenant_id = get_auth_tenant_id());
