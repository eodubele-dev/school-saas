-- Add metadata columns to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS paystack_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS evidence_url TEXT;

-- Index for paystack reference
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON public.transactions USING gin (paystack_metadata);
