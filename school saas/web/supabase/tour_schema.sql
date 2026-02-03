-- Add first_login column for Onboarding Tour
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT TRUE;

-- Create server action helper to complete onboarding (SQL function not strictly needed if we update via RLS, but standardizing)
