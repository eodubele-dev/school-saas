-- LINK STUDENT TO PARENT
-- Run this in your Supabase SQL Editor
-- Replace 'parent@school1.com' with the email you use to login

DO $$
DECLARE
    v_parent_id uuid;
    v_tenant_id uuid;
    v_class_id uuid;
BEGIN
    -- 1. Get your User ID
    SELECT id INTO v_parent_id FROM auth.users WHERE email = 'parent@school1.com'; -- <--- CHANGE THIS EMAIL
    
    IF v_parent_id IS NULL THEN
        RAISE NOTICE 'User not found! Check the email.';
        RETURN;
    END IF;

    -- 2. Get active tenant
    SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;

    -- 3. Get a class
    SELECT id INTO v_class_id FROM public.classes LIMIT 1;
    
    -- 4. Check if student exists, if not create one
    IF NOT EXISTS (SELECT 1 FROM public.students WHERE parent_id = v_parent_id) THEN
        -- Verify we have at least one student in the system to link, OR create a new one
        UPDATE public.students 
        SET parent_id = v_parent_id 
        WHERE id = (SELECT id FROM public.students LIMIT 1);
        
        -- If update didn't match (empty table), Insert new
        INSERT INTO public.students (tenant_id, full_name, parent_id, class_id)
        SELECT v_tenant_id, 'David Odubele', v_parent_id, v_class_id
        WHERE NOT EXISTS (SELECT 1 FROM public.students WHERE parent_id = v_parent_id);
    END IF;
    
    -- 5. Ensure Profile Role is Parent
    UPDATE public.profiles SET role = 'parent' WHERE id = v_parent_id;

END $$;
