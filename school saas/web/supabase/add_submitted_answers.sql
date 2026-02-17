-- Add submitted_answers column to store user responses for review
ALTER TABLE public.cbt_attempts 
ADD COLUMN IF NOT EXISTS submitted_answers JSONB DEFAULT '{}'::jsonb;
