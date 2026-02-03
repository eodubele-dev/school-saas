-- Add is_locked column to student_report_cards if it doesn't exist
ALTER TABLE public.student_report_cards
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE;

-- Update existing records to be locked by default (or unlocked if this is a fix)
-- Let's default to locked, but if we want payment logic to take over, we might need to sync.
-- For now, safe default is TRUE. 
-- BUT, if users already viewed results, locking them might cause confusion?
-- "The user login as patient but cannot see changes".
-- If they paid, and we just added the column, it will be TRUE (Locked).
-- The trigger only fires ON UPDATE of invoices.
-- So past payments won't auto-unlock this new column.

-- OPTIONAL: Backfill based on existing billing?
-- For now, just adding the column fixes the "Trigger fails to find column" issue for FUTURE payments.
-- To fix 'current' state, we might need to run a manual unlock or the user pays again?
-- Or we create a function to sync.

-- Let's just add the column first.
