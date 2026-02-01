-- Bursar Payroll Hub Schema

-- 1. Salary Structures Table
-- Defines the financial profile for each staff member
create table if not exists public.salary_structures (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    staff_id uuid references public.profiles(id) not null unique, -- One structure per staff
    base_salary numeric not null default 0,
    housing_allowance numeric default 0,
    transport_allowance numeric default 0,
    tax_deduction numeric default 0, -- Fixed amount or percentage? Assuming fixed for simplicity
    pension_deduction numeric default 0,
    bank_name text,
    account_number text,
    account_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Payroll Runs Table
-- Represents a monthly payroll cycle (e.g., "October 2023 Payment")
create table if not exists public.payroll_runs (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    month text not null, -- e.g., "September"
    year integer not null, -- e.g., 2026
    status text check (status in ('draft', 'approved', 'disbursed')) default 'draft',
    total_payout numeric default 0,
    generated_by uuid references public.profiles(id),
    approved_by uuid references public.profiles(id),
    disbursed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tenant_id, month, year) -- Prevent duplicate runs for same month
);

-- 3. Payroll Items Table
-- Individual line items for each staff in a run
create table if not exists public.payroll_items (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    payroll_run_id uuid references public.payroll_runs(id) on delete cascade not null,
    staff_id uuid references public.profiles(id) not null,
    
    -- Snapshot of earnings at generation time
    base_salary numeric not null,
    total_allowances numeric not null,
    
    -- Attendance Logic
    days_present integer default 0,
    days_absent integer default 0,
    lateness_count integer default 0,
    
    -- Deductions
    attendance_deductions numeric default 0, -- Calculated from absences/lateness
    tax_deduction numeric default 0,
    pension_deduction numeric default 0,
    
    -- Final
    net_pay numeric not null,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.salary_structures enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;

-- Only Bursars/Admins/Principals can view/manage payroll
create policy "Bursars can view all salary structures" on public.salary_structures
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = salary_structures.tenant_id
        )
    );

create policy "Bursars can manage salary structures" on public.salary_structures
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = salary_structures.tenant_id
        )
    );

create policy "Bursars can manage payroll runs" on public.payroll_runs
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = payroll_runs.tenant_id
        )
    );

create policy "Bursars can manage payroll items" on public.payroll_items
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = payroll_items.tenant_id
        )
    );

-- Staff can view their own payslips (Payroll Items)
create policy "Staff can view own payroll items" on public.payroll_items
    for select using (auth.uid() = staff_id);
