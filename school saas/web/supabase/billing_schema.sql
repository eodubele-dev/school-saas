-- Billing & Invoicing Schema

-- 1. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) NOT NULL,
    parent_id UUID REFERENCES public.profiles(id), -- Optional, useful for query optimization
    term TEXT NOT NULL, -- e.g., '1st Term 2025/2026'
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Invoice Items (Line items)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL, -- e.g., 'Tuition Fee'
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Fee Structure (Configuration for Automating Generation)
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id), -- If null, applies to all? Better to be specific.
    name TEXT NOT NULL, -- e.g., 'JSS 1 Tuition'
    amount NUMERIC(12, 2) NOT NULL,
    term TEXT NOT NULL, -- '1st', '2nd', '3rd'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Invoices viewable by tenant" ON public.invoices
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Invoice items viewable by tenant" ON public.invoice_items
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Fee structures viewable by tenant" ON public.fee_structures
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_student ON public.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
