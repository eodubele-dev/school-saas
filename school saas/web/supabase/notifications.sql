-- Create notification_settings table
create table if not exists public.notification_settings (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  
  -- Financial
  fee_reminders boolean default true,
  payment_confirmations boolean default true,
  outstanding_balance_alerts boolean default true,

  -- Safety & Attendance
  attendance_clock_in boolean default true,
  attendance_clock_out boolean default true,
  absence_alerts boolean default true,

  -- Academic
  result_published boolean default true,
  grade_updates boolean default false,
  assignment_reminders boolean default false,

  -- Logistics
  bus_arrival_alerts boolean default true,
  bus_departure_alerts boolean default true,
  maintenance_updates boolean default true,

  -- System Critical (Force True usually)
  security_alerts boolean default true,
  forensic_grade_changes boolean default true,

  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id),

  unique(tenant_id)
);

-- Enable RLS
alter table public.notification_settings enable row level security;

-- Policies
create policy "Notification settings viewable by tenant admins" on public.notification_settings
  for select using (
    tenant_id = (select tenant_id from public.profiles where id = auth.uid())
    and
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'manager', 'owner', 'proprietor', 'bursar')
    )
  );

create policy "Notification settings updateable by tenant admins" on public.notification_settings
  for update using (
    tenant_id = (select tenant_id from public.profiles where id = auth.uid())
    and
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'owner', 'proprietor')
    )
  );

create policy "Notification settings insertable by tenant admins" on public.notification_settings
  for insert with check (
    tenant_id = (select tenant_id from public.profiles where id = auth.uid())
    and
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('admin', 'owner', 'proprietor')
    )
  );
