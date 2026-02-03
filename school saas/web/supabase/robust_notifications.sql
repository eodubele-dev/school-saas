DO $$
BEGIN
    -- 1. Ensure Notifications Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            student_id UUID REFERENCES students(id) ON DELETE SET NULL,
            recipient_email TEXT,
            recipient_phone TEXT,
            channel TEXT CHECK (channel IN ('sms', 'email')),
            type TEXT CHECK (type IN ('result_published', 'payment_reminder', 'general')),
            status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
            provider_id TEXT,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            sent_at TIMESTAMPTZ
        );
    ELSE
        -- Add columns if missing (Idempotent)
        -- Note: We wrap in exception block if 'type' change causes issues, but adding columns is safe.
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_email TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channel TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS provider_id TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 2. Ensure Magic Links Table Exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'magic_links') THEN
         CREATE TABLE magic_links (
            token TEXT PRIMARY KEY,
            tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
            student_id UUID REFERENCES students(id) ON DELETE CASCADE,
            user_email TEXT,
            redirect_path TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
         ALTER TABLE magic_links ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE CASCADE;
         ALTER TABLE magic_links ADD COLUMN IF NOT EXISTS user_email TEXT;
         ALTER TABLE magic_links ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;
    END IF;

    -- 3. Create Indexes (Safe if exists)
    CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);

END $$;
