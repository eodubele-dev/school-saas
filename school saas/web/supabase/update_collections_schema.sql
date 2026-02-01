-- REVENUE & COLLECTIONS SCHEMA UPDATE
-- Run this in your Supabase SQL Editor

-- 1. Add phone_number to Profiles (for parent notifications)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number text;

-- 2. Enhance Transactions Table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS evidence_url text,
ADD COLUMN IF NOT EXISTS paystack_metadata jsonb DEFAULT '{}'::jsonb;

-- 3. Create Storage Bucket for Payment Evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-evidence', 'payment-evidence', true) 
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS on storage (allow public read, restricted write)
DROP POLICY IF EXISTS "Public Evidence" ON storage.objects;
CREATE POLICY "Public Evidence" ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-evidence');

DROP POLICY IF EXISTS "Auth Upload Evidence" ON storage.objects;
CREATE POLICY "Auth Upload Evidence" ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'payment-evidence' 
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar')
    )
);

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
