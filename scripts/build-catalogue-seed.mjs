/**
 * build-catalogue-seed.mjs
 *
 * Parses STACKED_CONTENT_CATALOGUE_v2.md (the source of truth for all 100 plans)
 * and emits stacked_goals_seed.json — the file consumed by scripts/seed-catalogue.ts
 * and scripts/resolve-content.ts.
 *
 * The 15 goals that were already hand-curated (with verified URLs, expanded
 * "why it matters" copy and bespoke slugs/icons) are PRESERVED verbatim from the
 * existing seed; only their sort_weight is normalised. The other 85 plans are
 * generated from the catalogue tables.
 *
 *   node scripts/build-catalogue-seed.mjs
 *
 * Every goal ends with exactly 5 steps; every step carries one content item with
 * a search_query and verified:false / url:null — the resolver fills real URLs in
 * a later pass.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const CATALOGUE = path.join(ROOT, 'STACKED_CONTENT_CATALOGUE_v2.md');
const SEED = path.join(ROOT, 'stacked_goals_seed.json');

// Plan numbers whose goals are already curated in the existing seed, in the same
// order they appear in stacked_goals_seed.json. These are preserved as-is.
const CURATED_PLAN_NUMBERS = [1, 2, 3, 4, 5, 26, 27, 28, 29, 30, 66, 67, 68, 69, 70];

// Stream by plan number range.
function streamForPlan(n) {
  if (n <= 25) return 'money_foundations';
  if (n <= 65) return 'income_builders';
  return 'wealthy_habits';
}

// Category (from the catalogue meta line) → icon_key. The keys here must all be
// handled by src/components/main/GoalIcon.tsx.
const CATEGORY_ICON = {
  debt: 'credit-card',
  investing: 'trending-up',
  saving: 'piggy-bank',
  budgeting: 'wallet',
  retirement: 'umbrella',
  tax: 'file-text',
  tracking: 'bar-chart',
  credit: 'gauge',
  protection: 'shield',
  mindset: 'brain',
  behaviour: 'sparkles',
  income: 'briefcase',
  reselling: 'repeat',
  business: 'rocket',
  ecommerce: 'shopping-cart',
  creative: 'palette',
  content: 'pen-tool',
  freelancing: 'laptop',
  education: 'graduation-cap',
  digital: 'globe',
  service: 'wrench',
  teaching: 'book-open',
  remote: 'headphones',
  fitness: 'dumbbell',
  writing: 'pen-tool',
  language: 'languages',
  finance: 'calculator',
  photography: 'camera',
  property: 'home',
  coaching: 'users',
  food: 'utensils',
  skill: 'target',
  habit: 'sunrise',
  productivity: 'clock',
  marketing: 'megaphone',
  health: 'heart',
  lifestyle: 'coffee',
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitaliseFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Parse a "Content" cell like:  video · `debt snowball vs avalanche explained` · 8min
function parseContent(cell) {
  const parts = cell.split('·').map((p) => p.trim());
  const type = parts[0].replace(/[`*]/g, '').toLowerCase();
  const minutesPart = parts[parts.length - 1];
  const query = parts.slice(1, parts.length - 1).join(' · ').replace(/`/g, '').trim();
  const mins = parseInt((minutesPart.match(/(\d+)/) || [])[1] || '0', 10);
  return {
    type: ['video', 'article', 'tool'].includes(type) ? type : 'article',
    brief: capitaliseFirst(query),
    search_query: query,
    est_minutes: mins,
    verified: false,
    url: null,
  };
}

// Parse a "Score impact" cell like:  clarity+3, discipline+1
function parseScore(cell) {
  const out = {};
  for (const m of cell.matchAll(/([a-z_]+)\s*\+\s*(\d+)/g)) {
    out[m[1]] = parseInt(m[2], 10);
  }
  return out;
}

function parsePlans(md) {
  const lines = md.split(/\r?\n/);
  const plans = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const header = line.match(/^###\s+PLAN\s+(\d+)\s+—\s+(.+?)\s*$/);
    if (header) {
      if (current) plans.push(current);
      const num = parseInt(header[1], 10);
      // Meta line is the next non-empty line, wrapped in backticks.
      let meta = '';
      for (let j = i + 1; j < lines.length; j++) {
        const t = lines[j].trim();
        if (!t) continue;
        meta = t.replace(/`/g, '');
        break;
      }
      const metaParts = meta.split('·').map((p) => p.trim());
      const category = (metaParts[0] || '').toLowerCase();
      const difficulty = (metaParts[1] || '').toLowerCase();
      const est_duration = metaParts[2] || '';
      const tier = (metaParts[3] || '').toLowerCase();
      current = {
        number: num,
        title: header[2].trim(),
        stream: streamForPlan(num),
        category,
        difficulty,
        est_duration,
        is_premium: tier.includes('premium'),
        icon_key: CATEGORY_ICON[category] || 'target',
        steps: [],
      };
      continue;
    }

    if (current && /^\|\s*\d+\s*\|/.test(line)) {
      const cells = line.split('|').map((c) => c.trim());
      // cells[0] is '' (before first pipe). Real cells start at index 1.
      const stepNum = parseInt(cells[1], 10);
      if (!(stepNum >= 1 && stepNum <= 5)) continue;
      const stepTitle = cells[2];
      const why = cells[3];
      const actions = cells[4]
        .split('·')
        .map((a) => a.trim())
        .filter(Boolean);
      const content = parseContent(cells[5]);
      const score = parseScore(cells[6]);
      current.steps.push({
        step_number: stepNum,
        title: stepTitle,
        why_it_matters: why,
        action_items: actions,
        score_impact: score,
        content: [content],
      });
    }
  }
  if (current) plans.push(current);
  return plans;
}

function main() {
  const md = fs.readFileSync(CATALOGUE, 'utf-8');
  const existing = JSON.parse(fs.readFileSync(SEED, 'utf-8'));
  const plans = parsePlans(md);

  if (plans.length !== 100) {
    console.warn(`WARNING: parsed ${plans.length} plans (expected 100)`);
  }

  // Map curated plan number -> existing goal object (by position).
  const curatedByPlan = {};
  CURATED_PLAN_NUMBERS.forEach((planNum, idx) => {
    curatedByPlan[planNum] = existing.goals[idx];
  });

  const usedSlugs = new Set();
  const goals = [];

  for (const plan of plans) {
    const sortWeight = 1000 - plan.number; // catalogue order, lower plan = higher

    if (curatedByPlan[plan.number]) {
      const g = { ...curatedByPlan[plan.number], sort_weight: sortWeight };
      usedSlugs.add(g.slug);
      goals.push(g);
      continue;
    }

    let slug = slugify(plan.title);
    if (usedSlugs.has(slug)) slug = `${slug}-${plan.number}`;
    usedSlugs.add(slug);

    if (plan.steps.length !== 5) {
      console.warn(`WARNING: plan ${plan.number} (${plan.title}) has ${plan.steps.length} steps`);
    }

    goals.push({
      slug,
      title: plan.title,
      stream: plan.stream,
      category: plan.category,
      difficulty: plan.difficulty,
      est_duration: plan.est_duration,
      is_premium: plan.is_premium,
      icon_key: plan.icon_key,
      sort_weight: sortWeight,
      steps: plan.steps,
    });
  }

  const out = {
    _meta: {
      ...(existing._meta || {}),
      version: '2.0',
      generated_from: 'STACKED_CONTENT_CATALOGUE_v2.md',
      generated_at: new Date().toISOString(),
      count: goals.length,
    },
    goals,
  };

  fs.writeFileSync(SEED, JSON.stringify(out, null, 2) + '\n', 'utf-8');

  // Summary
  const streamCounts = {};
  let stepTotal = 0;
  let contentTotal = 0;
  let verifiedTotal = 0;
  for (const g of goals) {
    streamCounts[g.stream] = (streamCounts[g.stream] || 0) + 1;
    stepTotal += g.steps.length;
    for (const s of g.steps) {
      contentTotal += s.content.length;
      verifiedTotal += s.content.filter((c) => c.verified && c.url).length;
    }
  }
  console.log('=== build-catalogue-seed ===');
  console.log(`Goals:   ${goals.length}`);
  console.log(`Steps:   ${stepTotal}`);
  console.log(`Content: ${contentTotal} (verified: ${verifiedTotal})`);
  console.log('Streams:', streamCounts);
}

main();
