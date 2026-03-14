-- Migration: Add SMS and Clocking columns to student_attendance
-- This aligns the schema with the Teacher Dashboard requirements.

-- 1. Add columns to student_attendance
ALTER TABLE public.student_attendance 
ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clock_in_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clock_out_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS clocked_out_by UUID REFERENCES public.profiles(id);

-- 2. Add Index for performance on clocking
CREATE INDEX IF NOT EXISTS idx_student_attendance_clock_in ON public.student_attendance(clock_in_time);

-- 3. Comment describing columns
COMMENT ON COLUMN public.student_attendance.sms_sent IS 'Whether an absence/late alert was sent to the parent.';
COMMENT ON COLUMN public.student_attendance.clock_in_time IS 'Timestamp when the student was marked present/arrived.';
COMMENT ON COLUMN public.student_attendance.clock_out_time IS 'Timestamp when the student was checked out/departed.';
