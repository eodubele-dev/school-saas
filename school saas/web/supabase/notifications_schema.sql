-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL, -- Context
    recipient_email TEXT,
    recipient_phone TEXT,
    channel TEXT CHECK (channel IN ('sms', 'email')),
    type TEXT CHECK (type IN ('result_published', 'payment_reminder', 'general')),
    status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'delivered')) DEFAULT 'pending',
    provider_id TEXT, -- ID returned by Termii/Resend
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Create Magic Links Table for One-Click Login
CREATE TABLE IF NOT EXISTS magic_links (
    token TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- Who is this for?
    user_email TEXT, -- Who are we logging in as?
    redirect_path TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links(token);

-- RLS Policies (Simple for now: Admin can view all, recipient can view own potentially)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;

-- Allow logic to insert (Service Role usually handles this, but for Admin Dashboard visibility):
CREATE POLICY "Admins can view notifications" ON notifications
    FOR SELECT
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.tenant_id = notifications.tenant_id
            and profiles.role IN ('admin', 'bursar')
        )
    );

-- Magic links are usually server-side mostly, but might need public access for the route handler to check validity?
-- Actually, route handlers run on server, so Service Role is fine. We don't need public select if we use admin client.
