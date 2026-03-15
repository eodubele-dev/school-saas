-- Profile update requests table
CREATE TABLE IF NOT EXISTS public.profile_update_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    requested_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    description text NOT NULL,
    status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    admin_notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profile_update_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Parents can create requests for their children" ON public.profile_update_requests
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.students 
        WHERE id = student_id 
        AND parent_id = auth.uid()
    )
    AND requested_by = auth.uid()
);

CREATE POLICY "Parents can view their own requests" ON public.profile_update_requests
FOR SELECT USING (requested_by = auth.uid());

CREATE POLICY "Admins can manage all requests" ON public.profile_update_requests
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin' 
        AND tenant_id = profile_update_requests.tenant_id
    )
);

-- Indexing
CREATE INDEX idx_profile_req_student ON public.profile_update_requests(student_id);
CREATE INDEX idx_profile_req_parent ON public.profile_update_requests(requested_by);
CREATE INDEX idx_profile_req_status ON public.profile_update_requests(status, tenant_id);
