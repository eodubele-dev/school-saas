-- ==========================================
-- 1. FEE CATEGORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.fee_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- ==========================================
-- 2. FEE SCHEDULE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.fee_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.fee_categories(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, category_id)
);

-- ==========================================
-- 3. INVOICES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    term TEXT NOT NULL, -- e.g. "2023/2024 First Term"
    amount NUMERIC(12, 2) DEFAULT 0,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, partial, paid
    items JSONB DEFAULT '[]', -- Array of { description, amount }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_student ON public.invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_term ON public.invoices(tenant_id, term);

-- ==========================================
-- 4. TRANSACTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) DEFAULT 0,
    method TEXT NOT NULL, -- cash, transfer, paystack
    reference TEXT,
    status TEXT DEFAULT 'success',
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_student ON public.transactions(student_id);

-- ==========================================
-- 5. STAFF ATTENDANCE DISPUTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.staff_attendance_disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    distance_detected DOUBLE PRECISION,
    status TEXT DEFAULT 'pending', -- pending, approved, declined
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance_disputes ENABLE ROW LEVEL SECURITY;

-- Helper Policy: View by Tenant
DROP POLICY IF EXISTS "View Fees" ON public.fee_categories;
CREATE POLICY "View Fees" ON public.fee_categories FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Manage Fees" ON public.fee_categories;
CREATE POLICY "Manage Fees" ON public.fee_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar'))
);

DROP POLICY IF EXISTS "View Schedule" ON public.fee_schedule;
CREATE POLICY "View Schedule" ON public.fee_schedule FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Manage Schedule" ON public.fee_schedule;
CREATE POLICY "Manage Schedule" ON public.fee_schedule FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar'))
);

DROP POLICY IF EXISTS "View Invoices" ON public.invoices;
CREATE POLICY "View Invoices" ON public.invoices FOR SELECT USING (
    -- Admins/Bursars see all in tenant
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar') AND tenant_id = invoices.tenant_id))
    OR
    -- Parents see their kids' invoices
    (EXISTS (SELECT 1 FROM students WHERE id = invoices.student_id AND parent_id = auth.uid()))
);

DROP POLICY IF EXISTS "Manage Invoices" ON public.invoices;
CREATE POLICY "Manage Invoices" ON public.invoices FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar') AND tenant_id = invoices.tenant_id)
);

DROP POLICY IF EXISTS "View Transactions" ON public.transactions;
CREATE POLICY "View Transactions" ON public.transactions FOR SELECT USING (
    -- Admins/Bursars see all in tenant
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar') AND tenant_id = transactions.tenant_id))
    OR
    -- Parents see their kids' transactions
    (EXISTS (SELECT 1 FROM students WHERE id = transactions.student_id AND parent_id = auth.uid()))
);

DROP POLICY IF EXISTS "Manage Transactions" ON public.transactions;
CREATE POLICY "Manage Transactions" ON public.transactions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar') AND tenant_id = transactions.tenant_id)
);

DROP POLICY IF EXISTS "View Disputes" ON public.staff_attendance_disputes;
CREATE POLICY "View Disputes" ON public.staff_attendance_disputes FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Manage Disputes" ON public.staff_attendance_disputes;
CREATE POLICY "Manage Disputes" ON public.staff_attendance_disputes FOR ALL USING (
   tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
);
