-- Subjects (e.g. Mathematics, English)
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  name text not null,
  code text, -- e.g. MTH101
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Timetables (Schedule slots)
create table public.timetables (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.tenants(id) not null,
  class_id uuid references public.classes(id),
  subject_id uuid references public.subjects(id),
  teacher_id uuid references public.profiles(id),
  day_of_week text not null, -- 'Monday', 'Tuesday'...
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.subjects enable row level security;
alter table public.timetables enable row level security;

create policy "Subjects viewable by tenant" on public.subjects for select using (tenant_id = get_auth_tenant_id());
create policy "Timetables viewable by tenant" on public.timetables for select using (tenant_id = get_auth_tenant_id());
