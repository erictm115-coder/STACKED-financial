/**
 * seed-fallback-content.mjs
 *
 * Bug 2, Layer 2 — guarantees every goal_step has at least one step_content row.
 *
 * Any step that ended up with zero content rows (because the resolver couldn't
 * find a verified external link) gets a single in-app "guide" row generated from
 * its own why_it_matters / title, so the Plan Detail screen always has something
 * to show instead of looking broken.
 *
 * Fallback rows are marked with content_type = 'guide' and url = null — the UI
 * (src/app/plans/[planId].tsx) renders those as a dashed "Quick guide" card.
 *
 *   node scripts/seed-fallback-content.mjs
 *
 * Idempotent: only inserts for steps that currently have no content.
 */

import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim();

const { createClient } = await import('@supabase/supabase-js');
const sb = createClient(get('SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: steps, error: stepErr } = await sb
    .from('goal_steps')
    .select('id, title, why_it_matters');
  if (stepErr) throw stepErr;

  const { data: content, error: contentErr } = await sb
    .from('step_content')
    .select('step_id');
  if (contentErr) throw contentErr;

  const haveContent = new Set(content.map((c) => c.step_id));
  const emptySteps = steps.filter((s) => !haveContent.has(s.id));

  console.log(`Steps total: ${steps.length}`);
  console.log(`Steps with content BEFORE: ${steps.length - emptySteps.length}`);
  console.log(`Steps EMPTY (need fallback): ${emptySteps.length}`);

  let inserted = 0;
  for (const step of emptySteps) {
    const { error } = await sb.from('step_content').insert({
      step_id: step.id,
      content_type: 'guide',
      title: step.title,
      brief: step.why_it_matters || step.title,
      url: null,
      est_minutes: 5,
      source_query: null,
      verified: true, // real in-app content, just not an external link
      last_checked: new Date().toISOString(),
    });
    if (error) {
      console.error(`  [Error] step ${step.id}:`, error.message);
    } else {
      inserted++;
    }
  }

  // Verify
  const { data: after } = await sb.from('step_content').select('step_id');
  const haveAfter = new Set(after.map((c) => c.step_id));
  const stillEmpty = steps.filter((s) => !haveAfter.has(s.id)).length;

  console.log(`\nFallback guides inserted: ${inserted}`);
  console.log(`Steps with content AFTER: ${steps.length - stillEmpty}`);
  console.log(`Steps still empty: ${stillEmpty}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
