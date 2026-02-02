-- Insert a dummy log to verify the feed
-- NOTE: We must use the service_role key or simulate an authenticated user context if RLS is strict.
-- Since we are in SQL editor (DB Admin), we bypass RLS or are superuser.

-- Find a tenant and user to link to
DO $$
DECLARE
    v_tenant_id uuid;
    v_user_id uuid;
BEGIN
    SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_tenant_id IS NOT NULL THEN
        INSERT INTO public.audit_logs (
            tenant_id,
            actor_id,
            actor_name,
            actor_role,
            action,
            category,
            entity_type, 
            details,
            metadata,
            old_values,
            new_values
        ) VALUES (
            v_tenant_id,
            v_user_id,
            'System Admin',
            'admin',
            'UPDATE',
            'Financial',
            'invoice',
            'Manually deleted Invoice #9021 for Student: Chinedu Obi',
            '{"ip": "127.0.0.1", "user_agent": "Manual SQL Test"}'::jsonb,
            null,
            null
        );
        
        -- Add a Grade Change example
        INSERT INTO public.audit_logs (
            tenant_id,
            actor_id,
            actor_name,
            actor_role,
            action,
            category,
            entity_type, 
            details,
            metadata,
            old_values,
            new_values
        ) VALUES (
            v_tenant_id,
            v_user_id,
            'Mr. Uche',
            'teacher',
            'UPDATE',
            'Academic',
            'grade',
            'Grade Changed for Mathematics',
            '{"ip": "127.0.0.1", "device": "Infinix Note 30"}'::jsonb,
            '{"score": 45}'::jsonb,
            '{"score": 75}'::jsonb
        );
    END IF;
END $$;
