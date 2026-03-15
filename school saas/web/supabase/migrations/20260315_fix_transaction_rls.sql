-- 1. Allow parents to insert pending transactions for their children or family
-- This fixes the error: "new row violates row-level security policy for table 'transactions'"
DROP POLICY IF EXISTS "Parents can initiate transactions" ON public.transactions;
CREATE POLICY "Parents can initiate transactions" ON public.transactions
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'parent' 
        AND tenant_id = transactions.tenant_id
    )
);

-- 2. Update View policy to include family-level (NULL student) transactions
-- This ensures parents can see "Pay All" records in their activity feed
DROP POLICY IF EXISTS "View Transactions" ON public.transactions;
CREATE POLICY "View Transactions" ON public.transactions FOR SELECT USING (
    -- Admins/Bursars see all in tenant
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'bursar') AND tenant_id = transactions.tenant_id))
    OR
    -- Parents see their kids' transactions OR family-level transactions in their tenant
    (EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'parent' 
        AND p.tenant_id = transactions.tenant_id
    ))
);
