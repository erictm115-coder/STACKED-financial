-- Create user_plans table if not exists
create table if not exists public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  status text not null default 'active', -- active | completed
  created_at timestamptz default now(),
  unique (user_id, goal_id)
);

-- Create user_step_progress table if not exists
create table if not exists public.user_step_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  step_id uuid references public.goal_steps(id) on delete cascade not null,
  completed boolean not null default false,
  checked_items integer[] default '{}',
  completed_at timestamptz,
  score_impact jsonb,
  created_at timestamptz default now(),
  unique (user_id, step_id)
);

-- Create saved_goals table if not exists
create table if not exists public.saved_goals (
  user_id uuid references public.profiles(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, goal_id)
);

-- Create user_gamification table if not exists
create table if not exists public.user_gamification (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  total_stacks integer not null default 0,
  day_streak integer not null default 0,
  last_activity_date date default current_date
);

-- Add checked_items to track individual action item ticks
alter table public.user_step_progress
  add column if not exists checked_items integer[] default '{}';

-- Add completed_at timestamp
alter table public.user_step_progress
  add column if not exists completed_at timestamptz;

-- Add score_impact stored at completion time
alter table public.user_step_progress
  add column if not exists score_impact jsonb;

-- Increment stacks RPC function
create or replace function public.increment_stacks(uid uuid)
returns void language plpgsql security definer as $$
begin
  insert into public.user_gamification (user_id, total_stacks, day_streak, last_activity_date)
  values (uid, 1, 1, current_date)
  on conflict (user_id) do update set
    total_stacks = user_gamification.total_stacks + 1,
    day_streak = case
      when user_gamification.last_activity_date = current_date - interval '1 day'
        then user_gamification.day_streak + 1
      when user_gamification.last_activity_date = current_date
        then user_gamification.day_streak
      else 1
    end,
    last_activity_date = current_date;
end;
$$;

-- Enable RLS
alter table public.user_plans enable row level security;
alter table public.user_step_progress enable row level security;
alter table public.saved_goals enable row level security;
alter table public.user_gamification enable row level security;

-- user_plans RLS
drop policy if exists "Users can insert own plans" on public.user_plans;
create policy "Users can insert own plans" on public.user_plans
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own plans" on public.user_plans;
create policy "Users can update own plans" on public.user_plans
  for update using (auth.uid() = user_id);

drop policy if exists "Users can read own plans" on public.user_plans;
create policy "Users can read own plans" on public.user_plans
  for select using (auth.uid() = user_id);

-- user_step_progress RLS
drop policy if exists "Users can insert own progress" on public.user_step_progress;
create policy "Users can insert own progress" on public.user_step_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_step_progress;
create policy "Users can update own progress" on public.user_step_progress
  for update using (auth.uid() = user_id);

drop policy if exists "Users can read own progress" on public.user_step_progress;
create policy "Users can read own progress" on public.user_step_progress
  for select using (auth.uid() = user_id);

-- saved_goals RLS
drop policy if exists "Users can manage own saved goals" on public.saved_goals;
create policy "Users can manage own saved goals" on public.saved_goals
  for all using (auth.uid() = user_id);

-- user_gamification RLS
drop policy if exists "Users can read own gamification" on public.user_gamification;
create policy "Users can read own gamification" on public.user_gamification
  for select using (auth.uid() = user_id);

drop policy if exists "Users can update own gamification" on public.user_gamification;
create policy "Users can update own gamification" on public.user_gamification
  for update using (auth.uid() = user_id);

drop policy if exists "Users can insert own gamification" on public.user_gamification;
create policy "Users can insert own gamification" on public.user_gamification
  for insert with check (auth.uid() = user_id);

-- stacked_scores UPDATE RLS policy
drop policy if exists "Users can update own scores" on public.stacked_scores;
create policy "Users can update own scores" on public.stacked_scores
  for update using (auth.uid() = user_id);

-- DELETE policies for user plans and progress
drop policy if exists "Users can delete own plans" on public.user_plans;
create policy "Users can delete own plans" on public.user_plans
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_step_progress;
create policy "Users can delete own progress" on public.user_step_progress
  for delete using (auth.uid() = user_id);
