-- 1. Add evidence_url to transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'evidence_url') THEN
        ALTER TABLE public.transactions ADD COLUMN evidence_url TEXT;
    END IF;
END $$;

-- 2. Create Storage Bucket for Payment Evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-evidence', 'payment-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
DROP POLICY IF EXISTS "Evidence Public Access" ON storage.objects;
CREATE POLICY "Evidence Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'payment-evidence' );

DROP POLICY IF EXISTS "Evidence Authenticated Upload" ON storage.objects;
CREATE POLICY "Evidence Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'payment-evidence' AND auth.role() = 'authenticated' );
