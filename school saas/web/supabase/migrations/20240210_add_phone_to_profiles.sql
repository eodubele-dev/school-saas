-- Add phone column to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- Add index for potential searching
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
