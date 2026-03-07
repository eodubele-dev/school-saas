-- Migration: Create Tenant Discount Rules Table
-- Description: Stores configurable sibling and family fee waiver rules for automated invoicing.

CREATE TYPE discount_target_type AS ENUM ('cheapest_child', 'all_after_trigger', 'all_children');
CREATE TYPE discount_value_type AS ENUM ('percentage', 'flat');

CREATE TABLE public.tenant_discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_count INTEGER NOT NULL DEFAULT 3, -- e.g., 3 means rule activates if family has 3+ kids
    discount_type discount_value_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL, -- e.g., '50' for 50%, or '50000' for ₦50,000
    target_rule discount_target_type NOT NULL DEFAULT 'cheapest_child',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX idx_tenant_discount_rules_tenant_id ON public.tenant_discount_rules(tenant_id);

-- Row Level Security (RLS)
ALTER TABLE public.tenant_discount_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage all rules in their tenant
CREATE POLICY "Admins can manage tenant discount rules" ON public.tenant_discount_rules
    FOR ALL
    TO authenticated
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'bursar'))
    );

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at_tenant_discount_rules
    BEFORE UPDATE ON public.tenant_discount_rules
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Add to Realtime Publication if necessary
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_discount_rules;
