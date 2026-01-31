-- Add payments table for transaction history
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
  billing_id uuid REFERENCES public.billing(id) NOT NULL,
  amount numeric(10, 2) NOT NULL,
  reference text, -- Paystack reference or manual receipt number
  method text CHECK (method IN ('paystack', 'cash', 'bank_transfer')) DEFAULT 'paystack',
  status text CHECK (status IN ('success', 'pending', 'failed')) DEFAULT 'pending',
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Payments viewable by tenant" ON public.payments
  FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (tenant_id = get_auth_tenant_id()); -- Simplified for demo
