import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment!');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface ContentItem {
  type: 'video' | 'article' | 'tool';
  brief: string;
  search_query: string;
  est_minutes: number;
  verified: boolean;
  url: string | null;
}

interface Step {
  step_number: number;
  title: string;
  why_it_matters: string;
  action_items: string[];
  score_impact: Record<string, number>;
  content: ContentItem[];
}

interface Goal {
  slug: string;
  title: string;
  stream: string;
  category: string;
  difficulty: string;
  est_duration: string;
  is_premium: boolean;
  icon_key: string;
  sort_weight: number;
  steps: Step[];
}

interface SeedData {
  _meta: any;
  goals: Goal[];
}

async function main() {
  const seedPath = path.join(process.cwd(), 'stacked_goals_seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file stacked_goals_seed.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf-8');
  const data: SeedData = JSON.parse(raw);

  console.log('Seeding Supabase plan catalogue...');
  
  let goalsUpserted = 0;
  let stepsUpserted = 0;
  let contentInserted = 0;
  let contentSkipped = 0;

  for (const goal of data.goals) {
    console.log(`Seeding goal: ${goal.title} (${goal.slug})...`);
    
    const { data: goalData, error: goalError } = await supabaseAdmin
      .from('goals')
      .upsert({
        slug: goal.slug,
        title: goal.title,
        stream: goal.stream,
        category: goal.category,
        difficulty: goal.difficulty,
        est_duration: goal.est_duration,
        is_premium: goal.is_premium,
        icon_key: goal.icon_key,
        sort_weight: goal.sort_weight
      }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (goalError || !goalData) {
      console.error(`  [Error] Failed to seed goal ${goal.slug}:`, goalError?.message);
      continue;
    }

    const goalId = goalData.id;
    goalsUpserted++;

    for (const step of goal.steps) {
      const { data: stepData, error: stepError } = await supabaseAdmin
        .from('goal_steps')
        .upsert({
          goal_id: goalId,
          step_number: step.step_number,
          title: step.title,
          why_it_matters: step.why_it_matters,
          action_items: step.action_items,
          score_impact: step.score_impact
        }, { onConflict: 'goal_id,step_number' })
        .select('id')
        .single();

      if (stepError || !stepData) {
        console.error(`  [Error] Failed to seed step ${step.step_number} of goal ${goal.slug}:`, stepError?.message);
        continue;
      }

      const stepId = stepData.id;
      stepsUpserted++;

      // Delete existing content for the step first (idempotent seed)
      const { error: deleteError } = await supabaseAdmin
        .from('step_content')
        .delete()
        .eq('step_id', stepId);

      if (deleteError) {
        console.error(`  [Error] Failed to clear old content for step ${step.step_number}:`, deleteError.message);
      }

      for (const content of step.content) {
        if (!content.verified || !content.url) {
          console.log(`  [Skip] Content "${content.brief}" is unverified/has no URL.`);
          contentSkipped++;
          continue;
        }

        const { error: contentError } = await supabaseAdmin
          .from('step_content')
          .insert({
            step_id: stepId,
            content_type: content.type,
            title: content.brief,
            brief: content.brief,
            url: content.url,
            est_minutes: content.est_minutes,
            source_query: content.search_query || '',
            verified: content.verified,
            last_checked: new Date().toISOString()
          });

        if (contentError) {
          console.error(`  [Error] Failed to insert content "${content.brief}":`, contentError.message);
        } else {
          contentInserted++;
        }
      }
    }
  }

  console.log('\nSeeding completed.');
  console.log(`Goals upserted: ${goalsUpserted}`);
  console.log(`Steps upserted: ${stepsUpserted}`);
  console.log(`Content items inserted: ${contentInserted}`);
  console.log(`Content items skipped (unverified): ${contentSkipped}`);
}

main().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
