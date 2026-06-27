-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Onboarding answers table
create table public.onboarding_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  finance_frequency text,
  life_goal text,
  age_group text,
  last_control text,
  resonating_word text,
  money_habits text[],
  download_reason text,
  created_at timestamp with time zone default now()
);

-- Stacked scores table
create table public.stacked_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  overall integer default 0,
  money_mindset integer default 0,
  clarity integer default 0,
  discipline integer default 0,
  focus integer default 0,
  investment_readiness integer default 0,
  created_at timestamp with time zone default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.stacked_scores enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can read own answers" on public.onboarding_answers
  for select using (auth.uid() = user_id);

create policy "Users can insert own answers" on public.onboarding_answers
  for insert with check (auth.uid() = user_id);

create policy "Users can read own scores" on public.stacked_scores
  for select using (auth.uid() = user_id);

create policy "Users can insert own scores" on public.stacked_scores
  for insert with check (auth.uid() = user_id);
