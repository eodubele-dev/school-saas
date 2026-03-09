-- Create the global_debt_flags table outside of RLS tenant isolation
CREATE TABLE IF NOT EXISTS public.global_debt_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporting_tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    parent_phone_hash TEXT,
    parent_email_hash TEXT,
    student_name_fuzzy TEXT,
    parent_name_fuzzy TEXT,
    debt_amount_tier TEXT CHECK (debt_amount_tier IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast fuzzy and exact matching lookups
CREATE INDEX IF NOT EXISTS idx_global_debt_phone ON public.global_debt_flags(parent_phone_hash) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_global_debt_email ON public.global_debt_flags(parent_email_hash) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_global_debt_fuzzy_names ON public.global_debt_flags(student_name_fuzzy, parent_name_fuzzy) WHERE status = 'active';

-- Secure RPC to flag a debtor (Can only be called by an authenticated admin for their own tenant)
CREATE OR REPLACE FUNCTION public.flag_debtor(
    p_format_phone_hash TEXT,
    p_format_email_hash TEXT,
    p_student_name_fuzzy TEXT,
    p_parent_name_fuzzy TEXT,
    p_amount_tier TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_new_id UUID;
BEGIN
    -- Get the current user's tenant_id from the session (assumes app.current_tenant exists or use auth.uid() join)
    -- For this SaaS, tenant_id is often stored in app.current_tenant() or derived from the profiles table.
    SELECT tenant_id INTO v_tenant_id
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'bursar', 'owner');

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Only admins, bursars, or owners can flag debtors.';
    END IF;

    -- Insert the flag
    INSERT INTO public.global_debt_flags (
        reporting_tenant_id,
        parent_phone_hash,
        parent_email_hash,
        student_name_fuzzy,
        parent_name_fuzzy,
        debt_amount_tier,
        status
    ) VALUES (
        v_tenant_id,
        p_format_phone_hash,
        p_format_email_hash,
        p_student_name_fuzzy,
        p_parent_name_fuzzy,
        p_amount_tier,
        'active'
    ) RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$;

-- Secure RPC to check debt status during admission
CREATE OR REPLACE FUNCTION public.check_debt_status(
    p_phone_hash TEXT,
    p_email_hash TEXT,
    p_student_fuzzy TEXT,
    p_parent_fuzzy TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match RECORD;
    v_confidence TEXT := 'none';
BEGIN
    -- Note: We do NOT filter by tenant_id here, because we want to check the WHOLE network.
    
    -- Check 1: High Confidence (Exact Phone or Email match)
    SELECT * INTO v_match
    FROM public.global_debt_flags
    WHERE status = 'active' 
      AND (
          (p_phone_hash IS NOT NULL AND parent_phone_hash = p_phone_hash)
          OR 
          (p_email_hash IS NOT NULL AND parent_email_hash = p_email_hash)
      )
    LIMIT 1;

    IF FOUND THEN
        v_confidence := 'high';
    ELSE
        -- Check 2: Medium Confidence (Student Name + Parent Name fuzzy match) -- The anti-evasion check
        SELECT * INTO v_match
        FROM public.global_debt_flags
        WHERE status = 'active'
          AND student_name_fuzzy = p_student_fuzzy
          AND parent_name_fuzzy = p_parent_fuzzy
        LIMIT 1;
        
        IF FOUND THEN
            v_confidence := 'medium';
        END IF;
    END IF;

    IF v_confidence != 'none' THEN
        RETURN jsonb_build_object(
            'has_debt', true,
            'confidence', v_confidence,
            'amount_tier', v_match.debt_amount_tier
        );
    END IF;

    RETURN jsonb_build_object('has_debt', false);
END;
$$;

-- Secure RPC to resolve a debt flag
CREATE OR REPLACE FUNCTION public.resolve_debt_flag(p_flag_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_affected_rows INTEGER;
BEGIN
    -- Verify the user has permission and belongs to the tenant that reported the debt
    SELECT tenant_id INTO v_tenant_id
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'bursar', 'owner');

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Only admins, bursars, or owners can resolve debt flags.';
    END IF;

    UPDATE public.global_debt_flags
    SET status = 'resolved', updated_at = NOW()
    WHERE id = p_flag_id AND reporting_tenant_id = v_tenant_id;

    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    RETURN v_affected_rows > 0;
END;
$$;
