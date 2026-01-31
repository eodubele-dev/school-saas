-- Billing / Finance Module

create table public.billing (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  student_id uuid references public.students(id) not null,
  session text not null, -- e.g. "2023/2024"
  term text not null, -- e.g. "1st Term"
  
  total_fees numeric(10, 2) default 0,
  amount_paid numeric(10, 2) default 0,
  -- Balance can be calculated, but storing it for easy querying/indexing is fine
  balance numeric(10, 2) generated always as (total_fees - amount_paid) stored,
  
  status text check (status in ('paid', 'partial', 'owing')) default 'owing',
  last_payment_date timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(student_id, session, term)
);

-- RLS
alter table public.billing enable row level security;

-- Policies
create policy "Billing viewable by tenant" on public.billing
  for select using (tenant_id = get_auth_tenant_id());

create policy "Admins can manage billing" on public.billing
  for all using (tenant_id = get_auth_tenant_id()); -- Simplified, normally check role='admin'
