-- System Audit & Integrity Log Schema

-- 1. Create audit_logs table
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    actor_id uuid references public.profiles(id) on delete set null,
    actor_name text, -- Snapshot of name in case user is deleted
    actor_role text,
    action text not null, -- CREATE, UPDATE, DELETE, LOGIN, LOGIN_FAILED
    category text not null, -- Financial, Academic, System, Security
    entity_type text not null, -- invoice, grade, student, settings
    entity_id uuid,
    details text,
    metadata jsonb default '{}'::jsonb, -- IP, User Agent, Location
    old_values jsonb,
    new_values jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.audit_logs enable row level security;

-- 3. RLS Policies

-- Viewable by Admins and the Tenant Owner only
drop policy if exists "Audit logs viewable by admins" on public.audit_logs;
create policy "Audit logs viewable by admins" on public.audit_logs
    for select using (
        tenant_id = (select tenant_id from public.profiles where id = auth.uid())
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );

-- Insertable by Authenticated Users (Server-side triggers or actions will handle this)
-- But we want to ensure only the server works, or users can only insert their own actions.
-- For a robust system, we often allow insert if tenant matches.
drop policy if exists "Audit logs insertable by authenticated users" on public.audit_logs;
create policy "Audit logs insertable by authenticated users" on public.audit_logs
    for insert with check (
        tenant_id = (select tenant_id from public.profiles where id = auth.uid())
    );

-- STRICTLY NO UPDATE OR DELETE
-- We do NOT create policies for UPDATE or DELETE, effectively banning them for everyone (except service_role).

-- 4. Indexes for Performance
create index if not exists idx_audit_logs_tenant_created on public.audit_logs(tenant_id, created_at desc);
create index if not exists idx_audit_logs_category on public.audit_logs(category);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
