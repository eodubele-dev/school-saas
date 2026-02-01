-- Multi-Channel Communication Hub Schema

-- 1. Communication Settings
-- Stores provider configs and defaults
create table if not exists public.communication_settings (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    sms_provider text default 'termii',
    sms_enabled boolean default true,
    whatsapp_enabled boolean default true,
    email_enabled boolean default true,
    sms_sender_id text, -- e.g. "SCHOOL_NAME"
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Message Logs
-- Tracks all outgoing broadcasts (SMS, Email, WA) for audit and billing
create table if not exists public.message_logs (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    sender_id uuid references public.profiles(id), -- Who sent it?
    recipient_phone text,
    recipient_email text,
    recipient_name text,
    message_content text,
    channel text check (channel in ('sms', 'whatsapp', 'email', 'in-app')),
    status text check (status in ('queued', 'sent', 'delivered', 'failed')),
    provider_ref text, -- ID from Termii/Provider
    cost numeric default 0, -- Cost in Naira
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Chat Channels
-- 1-on-1 conversations between Staff and Parents
create table if not exists public.chat_channels (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid references public.tenants(id) not null,
    parent_id uuid references public.profiles(id) not null,
    staff_id uuid references public.profiles(id) not null,
    last_message_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(parent_id, staff_id) -- One thread per pair
);

-- 4. Chat Messages
-- Individual messages within a channel
create table if not exists public.chat_messages (
    id uuid default gen_random_uuid() primary key,
    channel_id uuid references public.chat_channels(id) on delete cascade not null,
    sender_id uuid references public.profiles(id) not null,
    content text,
    attachment_url text, -- For photos/PDFs
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.communication_settings enable row level security;
alter table public.message_logs enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;

-- Policies for Settings & Logs (Admins/Teachers)
create policy "Staff can view comms settings" on public.communication_settings
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'teacher', 'principal', 'bursar') and tenant_id = communication_settings.tenant_id
        )
    );

create policy "Staff can view message logs" on public.message_logs
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'teacher', 'principal', 'bursar') and tenant_id = message_logs.tenant_id
        )
    );

create policy "Staff can insert message logs" on public.message_logs
    for insert with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'teacher', 'principal', 'bursar') and tenant_id = message_logs.tenant_id
        )
    );

-- Policies for Chat Channels
create policy "Users can view their own charts" on public.chat_channels
    for select using (
        auth.uid() = parent_id or auth.uid() = staff_id
    );

create policy "System can create chats" on public.chat_channels
    for insert with check (
        auth.uid() = parent_id or auth.uid() = staff_id
    );

-- Policies for Chat Messages
create policy "Users can view messages in their channels" on public.chat_messages
    for select using (
        exists (
            select 1 from public.chat_channels
            where id = chat_messages.channel_id
            and (parent_id = auth.uid() or staff_id = auth.uid())
        )
    );

create policy "Users can send messages to their channels" on public.chat_messages
    for insert with check (
        exists (
            select 1 from public.chat_channels
            where id = chat_messages.channel_id
            and (parent_id = auth.uid() or staff_id = auth.uid())
        )
    );

create policy "Users can update read status" on public.chat_messages
    for update using (
        exists (
            select 1 from public.chat_channels
            where id = chat_messages.channel_id
            and (parent_id = auth.uid() or staff_id = auth.uid())
        )
    );
