-- UNIFIED SYSTEM CONNECTIVITY
-- This script enables the "Ripple Effect" features: Cross-Module Automation and Auditing.

-- 1. Create Notifications Table (Realtime)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Who sees this?
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT, -- Actionable link (e.g. /dashboard/invoices/123)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own notifications" ON public.notifications;
CREATE POLICY "Users view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Enable Realtime for Notifications (Important for the 'Pop')
-- Note: User must enable REPLICA IDENTITY FULL or similar if needed for specific columns, 
-- but default inserts work fine for realtime if table is enabled in publication.
-- (This usually requires Superuser, so assume it's enabled via Dashboard or `supabase_realtime` publication)


-------------------------------------------------------------------------
-- TRIGGER 1: FINANCIAL -> ACADEMIC (Auto-Unlock Results)
-------------------------------------------------------------------------

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
          AND term = NEW.term 
          AND session = NEW.session;
          
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

DROP TRIGGER IF EXISTS on_invoice_paid ON public.invoices;
CREATE TRIGGER on_invoice_paid
    AFTER UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.unlock_results_on_payment();


-------------------------------------------------------------------------
-- TRIGGER 2: ACADEMIC -> AUDIT (Log Grade Changes)
-------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_grade_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if scores changed
    IF NEW.ca1 IS DISTINCT FROM OLD.ca1 OR 
       NEW.ca2 IS DISTINCT FROM OLD.ca2 OR 
       NEW.exam IS DISTINCT FROM OLD.exam THEN
       
       INSERT INTO public.audit_logs (
           tenant_id, 
           actor_id, -- Will be null if triggered by system, or auth.uid() if RLS allow
           actor_name,
           action, 
           category, 
           entity_type, 
           entity_id, 
           details, 
           old_values, 
           new_values
       )
       VALUES (
           NEW.tenant_id,
           auth.uid(), -- Capture who made the change
           'User ' || auth.uid(), -- Placeholder name
           'UPDATE_GRADE', 
           'Academic', 
           'grade', 
           NEW.id, 
           'Grade modified for student ' || NEW.student_id,
           jsonb_build_object('ca1', OLD.ca1, 'ca2', OLD.ca2, 'exam', OLD.exam, 'total', OLD.total),
           jsonb_build_object('ca1', NEW.ca1, 'ca2', NEW.ca2, 'exam', NEW.exam, 'total', NEW.total)
       );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_grade_change ON public.student_grades;
CREATE TRIGGER on_grade_change
    AFTER UPDATE ON public.student_grades
    FOR EACH ROW
    EXECUTE FUNCTION public.log_grade_change();


-------------------------------------------------------------------------
-- TRIGGER 3: ATTENDANCE -> ALERTS (Absent Notification)
-------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.alert_on_absence()
RETURNS TRIGGER AS $$
DECLARE
    parent_uid UUID;
    student_name TEXT;
BEGIN
    IF NEW.status = 'absent' THEN
        -- 1. Get Student Name
        SELECT full_name INTO student_name FROM public.students WHERE id = NEW.student_id;
        
        -- 2. Find linked Parent User ID (for in-app notification)
        -- Assuming 'students' has a 'parent_id' which links to 'parents' table, 
        -- and 'parents' table might link to 'profiles' (users) via email or phone?
        -- For this demo, let's notify the SCHOOL ADMIN instead, or the Proprietor, 
        -- as the "Pulse" requirement suggests proprietor dashboard.
        
        -- Creating a generic "Admin Alert"
        INSERT INTO public.notifications (tenant_id, title, message, type, link)
        VALUES (
            NEW.tenant_id, 
            'Absentee Alert', 
            'Student ' || COALESCE(student_name, 'Unknown') || ' was marked absent today.',
            'warning',
            '/dashboard/admin/attendance'
        );
        
        -- Note: The Edge Function for SMS would be triggered via Webhook on this INSERT
        -- or handled by the client application for simplicity in this demo.
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_attendance_absent ON public.student_attendance;
CREATE TRIGGER on_attendance_absent
    AFTER INSERT OR UPDATE ON public.student_attendance
    FOR EACH ROW
    EXECUTE FUNCTION public.alert_on_absence();
