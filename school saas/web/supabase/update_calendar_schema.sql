-- Create school_events table for the calendar
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.school_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  type text CHECK (type IN ('academic', 'holiday', 'sports', 'exam')) DEFAULT 'academic',
  is_public boolean DEFAULT true,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Events viewable by tenant" ON public.school_events
  FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "Admins can manage events" ON public.school_events
  FOR ALL USING (tenant_id = get_auth_tenant_id());

-- Seed some initial data for visualization
INSERT INTO public.school_events (tenant_id, title, description, start_date, end_date, type)
SELECT 
  id as tenant_id, 
  'Resumption for 2nd Term', 
  'All students are expected to return to school.', 
  NOW() + INTERVAL '2 days', 
  NOW() + INTERVAL '2 days', 
  'academic'
FROM public.tenants LIMIT 1;

INSERT INTO public.school_events (tenant_id, title, description, start_date, end_date, type)
SELECT 
  id as tenant_id, 
  'Inter-House Sports Competition', 
  'Annual sports day at the main bowl.', 
  NOW() + INTERVAL '14 days', 
  NOW() + INTERVAL '14 days', 
  'sports'
FROM public.tenants LIMIT 1;

INSERT INTO public.school_events (tenant_id, title, description, start_date, end_date, type)
SELECT 
  id as tenant_id, 
  'Mid-Term Break', 
  'Short break for students and staff.', 
  NOW() + INTERVAL '30 days', 
  NOW() + INTERVAL '32 days', 
  'holiday'
FROM public.tenants LIMIT 1;
