-- Add passport_photo_url to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS passport_photo_url text;

-- Seed with a sample image for the demo student
-- Using a high-quality placeholder that looks like a passport photo
UPDATE public.students
SET passport_photo_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&h=250&auto=format&fit=crop'
WHERE id IN (SELECT id FROM public.students LIMIT 1);
