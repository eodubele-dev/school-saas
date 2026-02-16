-- FIX RLS: Allow Admins/Parents to view Student Attendance & Registers

-- 1. Policies for Student Attendance
--    (Ensure admins can see all student attendance in their tenant)
DROP POLICY IF EXISTS "Student attendance viewable by tenant" ON public.student_attendance;
CREATE POLICY "Student attendance viewable by tenant"
ON public.student_attendance
FOR SELECT
USING (
  exists (
    select 1 from public.students
    where students.id = student_attendance.student_id
    and students.tenant_id = get_auth_tenant_id()
  )
);

-- Note: The above policy relies on students table RLS or tenant check.
-- A simpler version might be if student_attendance has tenant_id directly.
-- Checking previous schema (Step 762) suggests it might not have tenant_id?
-- But let's check if student_attendance has tenant_id.
-- If not, we join via students.

-- 2. Policies for Attendance Registers
--    (Required for the join: link to register.date)
DROP POLICY IF EXISTS "Registers viewable by tenant" ON public.attendance_registers;
CREATE POLICY "Registers viewable by tenant"
ON public.attendance_registers
FOR SELECT
USING (
  tenant_id = get_auth_tenant_id()
);
