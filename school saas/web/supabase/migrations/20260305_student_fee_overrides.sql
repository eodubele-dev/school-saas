-- Create student_fee_addons table
CREATE TABLE IF NOT EXISTS public.student_fee_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.fee_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, category_id)
);

-- Create student_fee_exemptions table
CREATE TABLE IF NOT EXISTS public.student_fee_exemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.fee_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, category_id)
);

-- Enable RLS
ALTER TABLE public.student_fee_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_exemptions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (simple tenant isolation)
CREATE POLICY "Enable read/write for tenant users on student_fee_addons" 
ON public.student_fee_addons 
FOR ALL 
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Enable read/write for tenant users on student_fee_exemptions" 
ON public.student_fee_exemptions 
FOR ALL 
USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
