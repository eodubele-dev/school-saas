-- FIX: Add Clock In/Out times to Student Attendance
-- This enables tracking of exact arrival and departure times for audit purposes

alter table public.student_attendance 
add column if not exists clock_in_time timestamp with time zone default now(),
add column if not exists clock_out_time timestamp with time zone,
add column if not exists clocked_out_by uuid references public.profiles(id), -- Staff who checked them out
add column if not exists picked_up_by text, -- Name of parent/guardian
add column if not exists pickup_method text; -- bus, parent, walker
