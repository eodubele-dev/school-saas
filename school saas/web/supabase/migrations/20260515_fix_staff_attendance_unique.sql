-- Fix Staff Attendance Unique Constraint
-- Allows a staff member to have attendance records in different schools on the same day.

BEGIN;

-- 1. Find the existing unique constraint name
-- It is usually 'staff_attendance_staff_id_date_key' or similar
-- We can drop it using the index name if we are sure, but let's be safe.
ALTER TABLE public.staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_date_key;

-- 2. Add the new composite unique constraint
ALTER TABLE public.staff_attendance ADD CONSTRAINT staff_attendance_staff_id_date_tenant_id_key UNIQUE (staff_id, date, tenant_id);

COMMIT;
