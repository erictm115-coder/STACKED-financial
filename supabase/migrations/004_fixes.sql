-- 004_fixes.sql
-- Bug-fix migration. Apply via the Supabase SQL editor (DDL can't be pushed
-- through the REST API). The app already functions without this — it is
-- defensive hardening at the schema level.

-- ── Bug 1: prevent duplicate stacked_scores rows per user ────────────────────
-- Duplicate rows made single-row reads in handleStepComplete throw
-- ("Failed to handle step completion"). The client now tolerates duplicates,
-- but a unique constraint stops them being created in the first place.

-- 1. De-duplicate, keeping the most recent row per user.
delete from public.stacked_scores s
using public.stacked_scores newer
where s.user_id = newer.user_id
  and s.created_at < newer.created_at;

-- 2. Enforce one score row per user going forward (enables a real upsert).
alter table public.stacked_scores
  drop constraint if exists stacked_scores_user_id_key;
alter table public.stacked_scores
  add constraint stacked_scores_user_id_key unique (user_id);

-- ── Bug 2: mark in-app fallback guide content ────────────────────────────────
-- The UI also detects fallbacks via content_type = 'guide', so this column is
-- optional metadata; included for explicit querying/reporting.
alter table public.step_content
  add column if not exists is_fallback boolean default false;

update public.step_content
  set is_fallback = true
  where content_type = 'guide' and url is null and is_fallback is distinct from true;
