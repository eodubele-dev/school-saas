-- SMS Wallet Auto-Deduction Trigger
-- Automatically deducts SMS cost from tenant wallet when a transaction is logged

CREATE OR REPLACE FUNCTION deduct_sms_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct the cost from the tenant's SMS balance
    UPDATE public.tenants
    SET sms_balance = sms_balance - NEW.cost
    WHERE id = NEW.tenant_id;

    -- Check if balance went negative (shouldn't happen with proper validation)
    IF (SELECT sms_balance FROM public.tenants WHERE id = NEW.tenant_id) < 0 THEN
        RAISE EXCEPTION 'Insufficient SMS balance for tenant %', NEW.tenant_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-deduct on SMS transaction insert
DROP TRIGGER IF EXISTS trigger_deduct_sms_wallet ON public.sms_transactions;
CREATE TRIGGER trigger_deduct_sms_wallet
    AFTER INSERT ON public.sms_transactions
    FOR EACH ROW
    EXECUTE FUNCTION deduct_sms_wallet();

COMMENT ON FUNCTION deduct_sms_wallet() IS 'Automatically deducts SMS cost from tenant wallet balance when a new SMS transaction is logged. Ensures real-time balance tracking and prevents overdraft.';
