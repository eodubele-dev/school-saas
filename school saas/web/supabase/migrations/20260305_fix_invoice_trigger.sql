CREATE OR REPLACE FUNCTION public.unlock_results_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if status changed to 'paid'
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        -- Unlock report cards for this student for the same term
        UPDATE public.student_report_cards
        SET is_locked = FALSE,
            updated_at = NOW()
        WHERE student_id = NEW.student_id
          AND term = NEW.term;
          
        -- (Optional) Log this system action
        INSERT INTO public.audit_logs (tenant_id, action, category, entity_type, entity_id, details, actor_name)
        VALUES (
            NEW.tenant_id, 
            'AUTO_UNLOCK', 
            'System', 
            'result', 
            NEW.student_id, 
            'Results automatically unlocked due to completed payment.', 
            'System Trigger'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
