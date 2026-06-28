create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  stream text not null,            -- money_foundations | income_builders | wealthy_habits
  category text,
  difficulty text,                 -- beginner | intermediate | advanced
  est_duration text,
  is_premium boolean default false,
  icon_key text,
  sort_weight integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  step_number integer not null,
  title text not null,
  why_it_matters text,
  action_items text[],
  score_impact jsonb,              -- {"discipline":2,"clarity":1}
  created_at timestamptz default now(),
  unique (goal_id, step_number)
);

create table if not exists public.step_content (
  id uuid primary key default gen_random_uuid(),
  step_id uuid references public.goal_steps(id) on delete cascade,
  content_type text,               -- video | article | tool
  title text,
  brief text,
  url text,
  thumbnail_url text,
  est_minutes integer,
  source_query text,               -- the query used to resolve it (for re-validation)
  verified boolean default false,
  last_checked timestamptz,
  created_at timestamptz default now()
);

-- Catalogue is public-read, admin-write
alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.step_content enable row level security;

create policy "Catalogue goals are public read" on public.goals
  for select using (true);
create policy "Catalogue steps are public read" on public.goal_steps
  for select using (true);
create policy "Catalogue content is public read" on public.step_content
  for select using (true);
