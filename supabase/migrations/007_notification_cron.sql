-- 007_notification_cron.sql
-- Schedules the daily push-notification fan-out.
--
-- send-daily-notifications is secured with a shared secret (see 005 / the edge
-- function). Nothing calls it on a schedule yet, so the feature is dormant. This
-- migration wires an in-database pg_cron job that POSTs to the function once a
-- day with the required x-cron-secret header, using pg_net for the HTTP call.
--
-- Secrets are NOT hardcoded here — the job reads them from Supabase Vault at run
-- time, so this file is safe to commit. Before the job can succeed you must add
-- two Vault secrets (Dashboard → Project Settings → Vault, or via SQL):
--
--   select vault.create_secret('https://<your-project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<same value as the CRON_SECRET edge-fn secret>', 'cron_secret');
--
-- If those secrets already exist, update them instead:
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'cron_secret'),
--     '<new value>');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent: drop any prior copy of this job before (re)creating it, so the
-- migration can be re-applied without erroring on a duplicate job name.
do $$
begin
  perform cron.unschedule('daily-stack-reminders');
exception
  when others then
    -- job did not exist yet; nothing to unschedule
    null;
end $$;

-- 17:00 UTC daily. pg_cron runs in UTC — pick the hour that best matches when
-- your audience is most active and adjust the cron expression accordingly.
select cron.schedule(
  'daily-stack-reminders',
  '0 17 * * *',
  $$
  select net.http_post(
    url := (
      select decrypted_secret from vault.decrypted_secrets where name = 'project_url'
    ) || '/functions/v1/send-daily-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (
        select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret'
      )
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
