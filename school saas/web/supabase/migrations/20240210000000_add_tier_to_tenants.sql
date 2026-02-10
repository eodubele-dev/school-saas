-- Add tier column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Free' CHECK (tier IN ('Free', 'Standard', 'Premium', 'Platinum'));

-- Update existing tenants to have a default tier if null (though default handles new ones)
UPDATE public.tenants SET tier = 'Free' WHERE tier IS NULL;
