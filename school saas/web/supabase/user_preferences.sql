create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  theme text default 'system', -- 'light', 'dark', 'system'
  language text default 'en-NG',
  font_size integer default 14, -- Base font size in pixels? Or scale factor? Let's say percentage 100 or relative scale 1-3. Prompt mentions "slider". Let's store as scale 1-5 or 75-125 %.
  hide_financial_figures boolean default false,
  
  -- Notification Matrix (JSONB for flexibility)
  notifications jsonb default '{
    "in_app": {"security": true, "academic": true, "financial": true, "emergency": true},
    "email": {"security": true, "academic": true, "financial": true, "emergency": true},
    "sms": {"security": false, "academic": false, "financial": false, "emergency": true}
  }'::jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.user_preferences enable row level security;

create policy "Users can view own preferences" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on public.user_preferences
  for update using (auth.uid() = user_id);

create policy "Users can insert own preferences" on public.user_preferences
  for insert with check (auth.uid() = user_id);

-- Function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_preferences_updated
  before update on public.user_preferences
  for each row execute procedure handle_updated_at();
