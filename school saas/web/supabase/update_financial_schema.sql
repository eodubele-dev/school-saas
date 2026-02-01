-- FINANCIAL CONFIG SCHEMA UPDATE

-- 1. Fee Categories Table
CREATE TABLE IF NOT EXISTS public.fee_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL, -- e.g., 'Tuition Fee'
    is_mandatory boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, name)
);

-- 2. Fee Schedule Table (The Matrix)
CREATE TABLE IF NOT EXISTS public.fee_schedule (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE, -- Null means Global fee? Better to be explicit or use application logic. Let's make class_id required for matrix.
    category_id uuid REFERENCES public.fee_categories(id) ON DELETE CASCADE NOT NULL,
    amount numeric(12, 2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, category_id)
);

-- 3. Enable RLS
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_schedule ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Categories: Viewable by tenant, Manageable by Admin/Bursar
CREATE POLICY "Fee categories viewable by tenant" ON public.fee_categories
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Fee categories manageable by admin/bursar" ON public.fee_categories
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar')
);

-- Schedule: Same as above
CREATE POLICY "Fee schedule viewable by tenant" ON public.fee_schedule
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Fee schedule manageable by admin/bursar" ON public.fee_schedule
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar')
);

-- Force Schema Refresh
NOTIFY pgrst, 'reload schema';
