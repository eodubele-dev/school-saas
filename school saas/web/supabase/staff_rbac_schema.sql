-- Staff Permissions & RBAC Schema

-- 1. Create staff_permissions table
create table if not exists public.staff_permissions (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    staff_id uuid references public.profiles(id) on delete cascade not null,
    designation text,
    can_view_financials boolean default false,
    can_edit_results boolean default false,
    can_send_bulk_sms boolean default false,
    signature_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tenant_id, staff_id)
);

-- 2. Enable RLS
alter table public.staff_permissions enable row level security;

-- 3. RLS Policies

-- Viewable by Admin and the Staff member themselves
drop policy if exists "Permissions viewable by admin and owner" on public.staff_permissions;
create policy "Permissions viewable by admin and owner" on public.staff_permissions
    for select using (
        tenant_id = (select tenant_id from public.profiles where id = auth.uid())
        and (
            (select role from public.profiles where id = auth.uid()) = 'admin'
            or auth.uid() = staff_id
        )
    );

-- Manageable only by Admin
drop policy if exists "Permissions manageable by admin" on public.staff_permissions;
create policy "Permissions manageable by admin" on public.staff_permissions
    for all using (
        tenant_id = (select tenant_id from public.profiles where id = auth.uid())
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );

-- Index for performance
create index if not exists idx_staff_permissions_staff_id on public.staff_permissions(staff_id);
