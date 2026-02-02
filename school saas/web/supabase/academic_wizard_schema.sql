-- ACADEMIC WIZARD SCHEMA

-- 1. Class Levels (e.g., JSS 1, SS 3)
-- This groups the "Arms" (which are stored in the 'classes' table)
create table if not exists public.class_levels (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    name text not null, -- e.g. "JSS 1"
    section text check (section in ('Junior', 'Senior', 'Nursery', 'Primary')), -- For organizing
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tenant_id, name)
);

-- 2. Update Classes to link to Class Levels
alter table public.classes
add column if not exists class_level_id uuid references public.class_levels(id),
add column if not exists capacity integer default 40;

-- 3. Update Subjects (for NERDC categorization)
alter table public.subjects
add column if not exists category text check (category in ('Junior', 'Senior', 'Universal'));

-- 4. Enable RLS for Class Levels
alter table public.class_levels enable row level security;

-- 5. Policies for Class Levels
drop policy if exists "Class levels viewable by tenant" on public.class_levels;
create policy "Class levels viewable by tenant" on public.class_levels
    for select using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));

drop policy if exists "Class levels manageable by admin" on public.class_levels;
create policy "Class levels manageable by admin" on public.class_levels
    for all using (
        (select tenant_id from public.profiles where id = auth.uid()) = tenant_id
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );

-- 6. Indexes
create index if not exists idx_classes_level on public.classes(class_level_id);
create index if not exists idx_subjects_category on public.subjects(category);

-- 7. Grading Scales (Added for Step 3)
create table if not exists public.grade_scales (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) on delete cascade not null,
    grade text not null, -- e.g. "A1"
    min_score integer not null default 0,
    max_score integer not null default 100,
    remark text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(tenant_id, grade)
);

-- 8. Enable RLS for Grade Scales
alter table public.grade_scales enable row level security;

-- 9. Policies for Grade Scales
drop policy if exists "Grade scales viewable by tenant" on public.grade_scales;
create policy "Grade scales viewable by tenant" on public.grade_scales
    for select using (tenant_id = (select tenant_id from public.profiles where id = auth.uid()));

drop policy if exists "Grade scales manageable by admin" on public.grade_scales;
create policy "Grade scales manageable by admin" on public.grade_scales
    for all using (
        (select tenant_id from public.profiles where id = auth.uid()) = tenant_id
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );

-- 10. Missing RLS Policies for Classes (Fixed)
drop policy if exists "Classes manageable by admin" on public.classes;
create policy "Classes manageable by admin" on public.classes
    for all using (
        (select tenant_id from public.profiles where id = auth.uid()) = tenant_id
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );

-- 11. Missing RLS Policies for Subjects (Fixed)
drop policy if exists "Subjects manageable by admin" on public.subjects;
create policy "Subjects manageable by admin" on public.subjects
    for all using (
        (select tenant_id from public.profiles where id = auth.uid()) = tenant_id
        and (select role from public.profiles where id = auth.uid()) = 'admin'
    );
