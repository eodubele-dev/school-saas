-- Add approval lock to report cards
ALTER TABLE public.student_report_cards 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Ensure RLS allows admins to update this
CREATE POLICY "Admins can approve results" ON public.student_report_cards
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'principal')
    )
);
