-- Seed SMS Transaction Data for Testing
-- This creates realistic SMS transaction history for demonstration

-- Note: Replace the tenant_id and sent_by UUIDs with actual values from your database
-- You can get these by running: SELECT id FROM tenants LIMIT 1; and SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_message_types TEXT[] := ARRAY['FEE REMINDER', 'ATTENDANCE ALERT', 'RESULT NOTIFICATION', 'SECURITY ALERT', 'GENERAL ANNOUNCEMENT'];
    v_statuses TEXT[] := ARRAY['delivered', 'delivered', 'delivered', 'pending', 'failed'];
    v_parent_names TEXT[] := ARRAY['Mrs. Adebayo', 'Mr. Okonkwo', 'Mrs. Ibrahim', 'Mr. Chukwu', 'Mrs. Eze', 'Mr. Bello', 'Mrs. Okoro', 'Mr. Musa'];
    v_phones TEXT[] := ARRAY['08012345678', '08123456789', '08134567890', '08145678901', '08156789012', '08167890123', '08178901234', '08189012345'];
    i INTEGER;
BEGIN
    -- Get the first tenant and user (you may need to adjust this)
    SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    -- Only proceed if we have valid IDs
    IF v_tenant_id IS NOT NULL AND v_user_id IS NOT NULL THEN
        -- Insert 30 sample SMS transactions
        FOR i IN 1..30 LOOP
            INSERT INTO public.sms_transactions (
                tenant_id,
                recipient_name,
                recipient_phone,
                message_type,
                message_content,
                status,
                cost,
                sent_by,
                sent_at,
                delivery_time
            ) VALUES (
                v_tenant_id,
                v_parent_names[1 + (i % array_length(v_parent_names, 1))],
                v_phones[1 + (i % array_length(v_phones, 1))],
                v_message_types[1 + (i % array_length(v_message_types, 1))],
                'Dear Parent, this is an automated message from EduFlow Platinum.',
                v_statuses[1 + (i % array_length(v_statuses, 1))],
                5.00,
                v_user_id,
                NOW() - (i || ' hours')::INTERVAL,
                CASE 
                    WHEN v_statuses[1 + (i % array_length(v_statuses, 1))] = 'delivered' 
                    THEN NOW() - (i || ' hours')::INTERVAL + INTERVAL '2 minutes'
                    ELSE NULL
                END
            );
        END LOOP;

        RAISE NOTICE 'Successfully inserted 30 SMS transaction records for tenant %', v_tenant_id;
    ELSE
        RAISE NOTICE 'No tenant or user found. Please create a tenant and user first.';
    END IF;
END $$;

-- Verify the data
SELECT 
    recipient_name,
    recipient_phone,
    message_type,
    status,
    cost,
    sent_at
FROM public.sms_transactions
ORDER BY sent_at DESC
LIMIT 10;
