-- EMERGENCY FIX: Missing Unique Constraint
-- Run this in your Supabase SQL Editor to fix the "no unique constraint matching the ON CONFLICT specification" error when assigning teachers.

ALTER TABLE public.teacher_allocations
ADD CONSTRAINT uq_teacher_allocations UNIQUE (tenant_id, teacher_id, class_id, subject);

NOTIFY pgrst, 'reload schema';
