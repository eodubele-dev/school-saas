-- Add is_reconciled column to transactions table to allow Bursars to dismiss inbound payment alerts
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_reconciled BOOLEAN DEFAULT FALSE;
