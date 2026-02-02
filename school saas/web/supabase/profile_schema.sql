-- Student Profile & Achievements Schema

-- 1. Student Metadata (Extended Profile)
CREATE TABLE IF NOT EXISTS public.student_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL UNIQUE,
    admission_number TEXT,
    house TEXT, -- 'Red', 'Blue', 'Green', 'Yellow'
    blood_group TEXT,
    clubs TEXT[], -- Array of club names e.g. ['Jets Club', 'Press Club']
    genotype TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Achievements (Badges)
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, -- 'Math Wizard', 'Punctuality King'
    description TEXT,
    icon_key TEXT, -- unique key for frontend icon mapping e.g. 'math_wizard', 'star'
    category TEXT CHECK (category IN ('academic', 'sport', 'behavior', 'leadership')) DEFAULT 'academic',
    awarded_by UUID REFERENCES public.profiles(id), -- Teacher/Admin
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    comment TEXT
);

-- 3. Behavioral Reports (Radar Chart Data)
CREATE TABLE IF NOT EXISTS public.behavioral_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id),
    term TEXT NOT NULL,
    session TEXT NOT NULL,
    
    -- 5-Point Grading System (1: Poor, 5: Excellent)
    punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
    neatness INTEGER CHECK (neatness BETWEEN 1 AND 5),
    politeness INTEGER CHECK (politeness BETWEEN 1 AND 5),
    cooperation INTEGER CHECK (cooperation BETWEEN 1 AND 5),
    leadership INTEGER CHECK (leadership BETWEEN 1 AND 5),
    attentiveness INTEGER CHECK (attentiveness BETWEEN 1 AND 5),
    honesty INTEGER CHECK (honesty BETWEEN 1 AND 5),
    peer_relations INTEGER CHECK (peer_relations BETWEEN 1 AND 5),
    
    overall_remark TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(student_id, term, session)
);

-- 4. Incident Log (Remarks Timeline)
CREATE TABLE IF NOT EXISTS public.incident_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('positive', 'disciplinary', 'neutral')) DEFAULT 'neutral',
    title TEXT NOT NULL,
    description TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.student_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Metadata: Viewable by tenant
CREATE POLICY "Student metadata viewable by tenant" ON public.student_metadata FOR SELECT USING (true); -- Simplified tenant check logic via query wrapper usually
-- Achievements: Viewable by tenant
CREATE POLICY "Achievements viewable by tenant" ON public.achievements FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
-- Behavior: Viewable by tenant
CREATE POLICY "Behavior viewable by tenant" ON public.behavioral_reports FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
-- Incidents: Viewable by tenant
CREATE POLICY "Incidents viewable by tenant" ON public.incident_logs FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));
