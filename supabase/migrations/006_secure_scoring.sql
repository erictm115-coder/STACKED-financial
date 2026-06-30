-- 006_secure_scoring.sql
-- Audit finding C1: score & gamification were client-trusted and directly
-- writable. Any authenticated user could PATCH stacked_scores / user_gamification
-- to arbitrary values (overall=99, total_stacks=9999), and re-toggling a step
-- re-applied its score (farming), because every UPDATE policy only checked
-- `auth.uid() = user_id` and the client computed the new values.
--
-- This migration moves all score/stack MUTATION into SECURITY DEFINER functions
-- that (a) read the canonical score_impact from goal_steps — never the client,
-- (b) are idempotent (a step scores at most once; a plan completes at most once),
-- (c) clamp to <= 99, then REVOKES direct client writes to those tables.
--
-- BEHAVIOUR CHANGE TO BE AWARE OF: re-completing a step (uncheck -> recheck) no
-- longer re-adds its score. This is intentional — it closes the farming bug.
--
-- DEPLOY ORDERING: DDL can't be pushed through the REST API. Apply this in the
-- Supabase SQL editor *before/with* shipping the matching app build (which calls
-- apply_step_score / complete_user_plan). Requires 005_notifications.sql first
-- (user_plans.completed_at).

-- ── Idempotency marker: a step's score is applied at most once ────────────────
alter table public.user_step_progress
  add column if not exists scored_at timestamptz;

-- ── Lock down direct writes to stacked_scores ────────────────────────────────
-- Clients may still read their row and INSERT their onboarding baseline, but may
-- NOT UPDATE it. Every increase now flows through apply_step_score().
drop policy if exists "Users can update own scores" on public.stacked_scores;

-- Constrain the baseline INSERT so it can't be abused to seed a 99 directly via
-- delete-then-insert. calculateScores() clamps every dimension to 20..70, so a
-- legitimate baseline is never rejected.
drop policy if exists "Users can insert own scores" on public.stacked_scores;
create policy "Users can insert own baseline scores" on public.stacked_scores
  for insert with check (
    auth.uid() = user_id
    and overall <= 70 and money_mindset <= 70 and clarity <= 70
    and discipline <= 70 and focus <= 70 and investment_readiness <= 70
  );

-- ── Lock down direct writes to user_gamification ─────────────────────────────
-- Fully server-managed. Clients read only; all writes go through
-- complete_user_plan() (security definer, bypasses RLS).
drop policy if exists "Users can insert own gamification" on public.user_gamification;
drop policy if exists "Users can update own gamification" on public.user_gamification;

-- ── RPC 1: apply a completed step's canonical score, exactly once ────────────
create or replace function public.apply_step_score(p_step_id uuid)
returns public.stacked_scores
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_progress public.user_step_progress;
  v_impact jsonb;
  v_scores public.stacked_scores;
  v_key text;
  v_delta numeric;
  v_max_delta numeric := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Caller must own a COMPLETED progress row for this step.
  select * into v_progress
  from public.user_step_progress
  where step_id = p_step_id and user_id = v_uid and completed = true;

  if not found then
    raise exception 'Step not completed by caller';
  end if;

  -- Idempotent: already scored -> return current scores unchanged.
  if v_progress.scored_at is not null then
    select * into v_scores from public.stacked_scores where user_id = v_uid limit 1;
    return v_scores;
  end if;

  -- Canonical impact comes from the catalogue, never from the client.
  select score_impact into v_impact from public.goal_steps where id = p_step_id;
  v_impact := coalesce(v_impact, '{}'::jsonb);

  -- Ensure a score row exists.
  select * into v_scores from public.stacked_scores where user_id = v_uid limit 1;
  if not found then
    insert into public.stacked_scores (user_id) values (v_uid) returning * into v_scores;
  end if;

  -- Apply each known sub-dimension, clamped to <= 99. Track the largest delta;
  -- `overall` rises by that max (mirrors the prior client logic).
  for v_key, v_delta in select key, value::numeric from jsonb_each_text(v_impact)
  loop
    if v_delta > v_max_delta then v_max_delta := v_delta; end if;
    if v_key in ('moneyMindset', 'money_mindset') then
      update public.stacked_scores set money_mindset = least(99, money_mindset + v_delta) where id = v_scores.id;
    elsif v_key in ('investmentReadiness', 'investment_readiness') then
      update public.stacked_scores set investment_readiness = least(99, investment_readiness + v_delta) where id = v_scores.id;
    elsif v_key = 'clarity' then
      update public.stacked_scores set clarity = least(99, clarity + v_delta) where id = v_scores.id;
    elsif v_key = 'discipline' then
      update public.stacked_scores set discipline = least(99, discipline + v_delta) where id = v_scores.id;
    elsif v_key = 'focus' then
      update public.stacked_scores set focus = least(99, focus + v_delta) where id = v_scores.id;
    end if;
  end loop;

  if v_max_delta > 0 then
    update public.stacked_scores set overall = least(99, overall + v_max_delta) where id = v_scores.id;
  end if;

  -- Mark scored so it can never be double-applied (closes the toggle-farm).
  update public.user_step_progress set scored_at = now() where id = v_progress.id;

  select * into v_scores from public.stacked_scores where id = v_scores.id;
  return v_scores;
end;
$$;

-- ── RPC 2: complete a plan + bump gamification, exactly once ──────────────────
create or replace function public.complete_user_plan(p_plan_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_plan public.user_plans;
  v_total int;
  v_done int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Caller must own the plan.
  select * into v_plan from public.user_plans where id = p_plan_id and user_id = v_uid;
  if not found then
    raise exception 'Plan not found for caller';
  end if;

  -- Idempotent: already completed -> no-op, no double stack.
  if v_plan.status = 'completed' then
    return false;
  end if;

  -- Only complete when every step of the goal is genuinely done.
  select count(*) into v_total from public.goal_steps where goal_id = v_plan.goal_id;
  if v_total = 0 then
    return false;
  end if;

  select count(*) into v_done
  from public.user_step_progress usp
  join public.goal_steps gs on gs.id = usp.step_id
  where gs.goal_id = v_plan.goal_id
    and usp.user_id = v_uid
    and usp.completed = true;

  if v_done < v_total then
    return false;
  end if;

  update public.user_plans
    set status = 'completed', completed_at = now()
    where id = p_plan_id;

  -- Bump stacks + streak (same logic as increment_stacks).
  insert into public.user_gamification (user_id, total_stacks, day_streak, last_activity_date)
  values (v_uid, 1, 1, current_date)
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

  return true;
end;
$$;

-- ── Grants: only authenticated users may invoke ──────────────────────────────
revoke all on function public.apply_step_score(uuid) from public;
revoke all on function public.complete_user_plan(uuid) from public;
grant execute on function public.apply_step_score(uuid) to authenticated;
grant execute on function public.complete_user_plan(uuid) to authenticated;
