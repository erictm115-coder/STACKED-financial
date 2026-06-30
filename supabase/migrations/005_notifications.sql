-- Add completed_at column to user_plans
alter table public.user_plans add column if not exists completed_at timestamptz;

-- Add notification push token and settings columns to profiles
alter table public.profiles add column if not exists expo_push_token text;
alter table public.profiles add column if not exists daily_stack_reminder boolean default true;

-- Create notification log table
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  notification_id text not null,
  category text,
  sent_at timestamptz default now(),
  opened_at timestamptz
);

-- Enable RLS and add read policy
alter table public.notification_log enable row level security;

drop policy if exists "Users read own notification log" on public.notification_log;
create policy "Users read own notification log" on public.notification_log
  for select using (auth.uid() = user_id);
