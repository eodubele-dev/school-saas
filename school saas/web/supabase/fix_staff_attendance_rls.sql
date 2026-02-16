-- FIX RLS: Allow staff to Clock In/Out (Insert/Update their own attendance)

-- 1. Allow staff to INSERT their own attendance record
CREATE POLICY "Staff can clock in (insert own record)"
ON public.staff_attendance
FOR INSERT
WITH CHECK (
  staff_id = auth.uid()
);

-- 2. Allow staff to UPDATE their own attendance record (e.g., Clock Out)
CREATE POLICY "Staff can clock out (update own record)"
ON public.staff_attendance
FOR UPDATE
USING (
  staff_id = auth.uid()
);

-- Note: The SELECT policy already exists in schema.sql:
-- create policy "Staff attendance viewable by tenant" on public.staff_attendance ...
