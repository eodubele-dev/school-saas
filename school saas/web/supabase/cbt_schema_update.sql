-- Add proctoring and scheduling features to CBT Quizzes
ALTER TABLE public.cbt_quizzes 
ADD COLUMN IF NOT EXISTS shuffle_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_marks NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add explanation field to CBT Questions for AI breakdowns
ALTER TABLE public.cbt_questions
ADD COLUMN IF NOT EXISTS explanation TEXT;
