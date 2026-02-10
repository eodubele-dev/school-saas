-- Add approval tracking columns to student_grades
ALTER TABLE student_grades 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add index for performance on approval queues
CREATE INDEX IF NOT EXISTS idx_student_grades_approval_status ON student_grades(approval_status);
CREATE INDEX IF NOT EXISTS idx_student_grades_is_locked ON student_grades(is_locked);
