-- Add attachment support to assignments
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Update RLS if necessary (usually select is enough if tenant_id is checked)
COMMENT ON COLUMN public.assignments.file_url IS 'URL to the assignment question paper or instructions file';
COMMENT ON COLUMN public.assignments.file_name IS 'Original name of the uploaded file';
