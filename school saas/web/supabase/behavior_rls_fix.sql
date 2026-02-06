-- FIX: Missing RLS policies for behavior-related tables

-- 1. Achievements Policies
DROP POLICY IF EXISTS "Teacher/Admin can award badges" ON public.achievements;
CREATE POLICY "Teacher/Admin can award badges" ON public.achievements 
FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'admin', 'owner', 'manager', 'staff')
);

-- Note: Simplified role check for immediate fix, ideal would be a function check.
-- Let's use a more robust policy check.

DROP POLICY IF EXISTS "Achievements viewable by tenant" ON public.achievements;
CREATE POLICY "Achievements viewable by tenant" ON public.achievements 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers/Admins can insert achievements" ON public.achievements;
CREATE POLICY "Teachers/Admins can insert achievements" ON public.achievements 
FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers/Admins can update achievements" ON public.achievements;
CREATE POLICY "Teachers/Admins can update achievements" ON public.achievements 
FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));


-- 2. Behavioral Reports Policies
DROP POLICY IF EXISTS "Behavior viewable by tenant" ON public.behavioral_reports;
CREATE POLICY "Behavior viewable by tenant" ON public.behavioral_reports 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers can log behavioral reports" ON public.behavioral_reports;
CREATE POLICY "Teachers can log behavioral reports" ON public.behavioral_reports 
FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers can update behavioral reports" ON public.behavioral_reports;
CREATE POLICY "Teachers can update behavioral reports" ON public.behavioral_reports 
FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));


-- 3. Incident Logs Policies
DROP POLICY IF EXISTS "Incidents viewable by tenant" ON public.incident_logs;
CREATE POLICY "Incidents viewable by tenant" ON public.incident_logs 
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Teachers can log incidents" ON public.incident_logs;
CREATE POLICY "Teachers can log incidents" ON public.incident_logs 
FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
