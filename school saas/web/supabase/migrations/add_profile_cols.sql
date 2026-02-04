-- Add missing columns to profiles table
alter table public.profiles 
add column if not exists phone text,
add column if not exists avatar_url text,
add column if not exists updated_at timestamp with time zone;

-- Add comment
comment on column public.profiles.phone is 'Contact phone number for the user';
comment on column public.profiles.avatar_url is 'URL to the user avatar image in storage';
comment on column public.profiles.updated_at is 'Timestamp of the last profile update';
