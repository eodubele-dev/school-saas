-- Reconciliation & End-of-Day Schema

-- 1. Daily Reconciliation Sessions
CREATE TABLE IF NOT EXISTS public.reconciliation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    bursar_id UUID REFERENCES public.profiles(id) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Cash Position
    system_cash_total NUMERIC(15, 2) DEFAULT 0, -- Calculated from system receipts
    physical_cash_total NUMERIC(15, 2) DEFAULT 0, -- User input
    cash_variance NUMERIC(15, 2) GENERATED ALWAYS AS (system_cash_total - physical_cash_total) STORED,
    variance_reason TEXT,
    
    -- Bank Position
    system_bank_total NUMERIC(15, 2) DEFAULT 0,
    statement_bank_total NUMERIC(15, 2) DEFAULT 0,
    
    status TEXT CHECK (status IN ('open', 'closed', 'flagged')) DEFAULT 'open',
    closed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cash Counts (Breakdown by Denomination)
CREATE TABLE IF NOT EXISTS public.cash_counts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.reconciliation_sessions(id) ON DELETE CASCADE NOT NULL,
    denomination TEXT NOT NULL, -- '1000', '500', '200', '100', '50', '20', '10', 'coins'
    bundle_count INTEGER DEFAULT 0, -- Full bundles (usually 100 notes, but configurable context)
    loose_count INTEGER DEFAULT 0, -- Individual notes
    total_value NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bank Statement Imports (Staging)
CREATE TABLE IF NOT EXISTS public.bank_imports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.reconciliation_sessions(id) ON DELETE CASCADE NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL, -- Credit is positive, Debit is negative
    reference_number TEXT,
    is_matched BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Transaction Matches (Linking System <-> Bank)
CREATE TABLE IF NOT EXISTS public.transaction_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    import_id UUID REFERENCES public.bank_imports(id) ON DELETE CASCADE NOT NULL,
    
    -- Link to system transaction entities (e.g. invoice payment, expense)
    -- Assuming a generic 'transactions' table or linking strictly to 'invoices' for now.
    -- For this MVP, we will link to 'invoices' (payments) or 'expenses'.
    -- Ideally, a unified ledger table exists, but we'll use a polymorphic-like approach or just ID ref.
    related_transaction_id UUID, -- ID of the payment record in system
    related_table TEXT, -- 'invoices' or 'expenses'
    
    match_score NUMERIC(5, 2), -- Confidence score of AI match
    matched_by TEXT CHECK (matched_by IN ('auto', 'manual')) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reconciliation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_matches ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for Tenant Isolation)
CREATE POLICY "Recon data viewable by tenant" ON public.reconciliation_sessions FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Recon data insertable by bursar" ON public.reconciliation_sessions FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Recon data updatable by bursar" ON public.reconciliation_sessions FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- (Similar policies for child tables implicitly covered by app logic, but explicitly adding for safety)
CREATE POLICY "Cash counts access" ON public.cash_counts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.reconciliation_sessions s WHERE s.id = cash_counts.session_id AND s.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
);
