-- Bursar Expense Tracker Schema

-- 1. Expense Categories Table
-- Pre-defined or dynamic list of expense types
create table if not exists public.expense_categories (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    name text not null, -- e.g. "Operations", "Academic", "Facilities"
    description text,
    is_system_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Expenses Table
-- Tracks individual outflows
create table if not exists public.expenses (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    category_id uuid references public.expense_categories(id),
    amount numeric not null,
    vendor_payee text not null, -- Who was paid?
    date date not null default CURRENT_DATE,
    description text,
    receipt_url text, -- Path to file in storage bucket
    recorded_by uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;

-- Policies
create policy "Bursars can view expense categories" on public.expense_categories
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = expense_categories.tenant_id
        )
    );

create policy "Bursars can manage expense categories" on public.expense_categories
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = expense_categories.tenant_id
        )
    );

create policy "Bursars can view expenses" on public.expenses
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = expenses.tenant_id
        )
    );

create policy "Bursars can manage expenses" on public.expenses
    for all using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'principal', 'bursar') and tenant_id = expenses.tenant_id
        )
    );

-- Storage Policy needed? 
-- Assuming 'receipts' bucket will be created via UI or script, 
-- but RLS for objects will match tenant_id logic or folder structure.
