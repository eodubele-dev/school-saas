-- BURSAR DASHBOARD SCHEMA UPDATE

-- 1. Update Profiles Role Constraint (if possible, or just ignore if it's already expanded)
-- Since we can't easily drop a constraint without knowing its name, we'll try to add it.
-- But usually, we just let it be or update it.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'teacher', 'parent', 'student', 'bursar'));

-- 2. Invoices Table (Consolidated)
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    term text NOT NULL, -- e.g., '2023/2024 1st Term'
    amount numeric(12, 2) DEFAULT 0 NOT NULL,
    amount_paid numeric(12, 2) DEFAULT 0 NOT NULL,
    status text CHECK (status IN ('pending', 'paid', 'partial', 'void')) DEFAULT 'pending',
    items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Transactions Table (Consolidated from payments/transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
    amount numeric(12, 2) NOT NULL,
    method text CHECK (method IN ('cash', 'bank_transfer', 'paystack', 'pos')) DEFAULT 'paystack',
    reference text, -- Payment ref or receipt #
    status text CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'success',
    date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Invoices: Viewable by tenant, Manageable by Admin/Bursar
CREATE POLICY "Invoices viewable by tenant" ON public.invoices
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Invoices manageable by admin/bursar" ON public.invoices
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar')
);

-- Transactions: Viewable by tenant, Manageable by Admin/Bursar
CREATE POLICY "Transactions viewable by tenant" ON public.transactions
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Transactions manageable by admin/bursar" ON public.transactions
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar')
);

-- Force Schema Refresh
NOTIFY pgrst, 'reload schema';
