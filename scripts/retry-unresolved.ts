import * as fs from 'fs';
import * as path from 'path';

/**
 * retry-unresolved.ts — Bug 2, Layer 1.
 *
 * Re-attempts content resolution for catalogue items that did not resolve to a
 * verified URL on the first pass. For each unresolved item it retries the
 * original `search_query`, and if that still finds nothing it retries a
 * BROADENED fallback query (stop-words and trailing qualifiers stripped), since
 * over-specific queries are the most common reason a good link wasn't found.
 *
 * Newly resolved URLs are written back into stacked_goals_seed.json (verified:true)
 * so a subsequent `seed-catalogue.ts` run inserts them. Whatever still fails is
 * re-written to scripts/unresolved.json.
 *
 *   npx tsx scripts/retry-unresolved.ts
 *
 * Requires YOUTUBE_API_KEY for video items. Article/tool items use a web search.
 * Items that never resolve are fine — Layer 2 (seed-fallback-content) guarantees
 * every step still gets an in-app guide card.
 */

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}
loadEnv();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  content: ContentItem[];
  [k: string]: any;
}
interface Goal {
  slug: string;
  steps: Step[];
  [k: string]: any;
}
interface SeedData {
  _meta: any;
  goals: Goal[];
}

const STOP_WORDS = new Set([
  'how', 'to', 'the', 'a', 'an', 'your', 'for', 'and', 'of', 'in', 'on', 'with',
  'explained', 'beginners', 'beginner', 'guide', 'step', 'by', 'tips', 'simple',
  'simply', 'easy', 'best', 'script', 'examples', 'example',
]);

/** Strip filler words / trailing qualifiers to broaden an over-specific query. */
function broaden(query: string): string {
  const words = query.toLowerCase().split(/\s+/).filter((w) => !STOP_WORDS.has(w));
  // Keep the most meaningful 4 words.
  return words.slice(0, 4).join(' ').trim() || query;
}

async function searchYouTube(query: string): Promise<string[]> {
  if (!YOUTUBE_API_KEY) return [];
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
    `&videoEmbeddable=true&relevanceLanguage=en&maxResults=3&order=relevance` +
    `&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  [YouTube ${res.status}]`);
      return [];
    }
    const data: any = await res.json();
    return (data.items || [])
      .map((i: any) => i.id?.videoId)
      .filter(Boolean)
      .map((id: string) => `https://www.youtube.com/watch?v=${id}`);
  } catch {
    return [];
  }
}

async function searchWeb(query: string): Promise<string[]> {
  const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const urls = [...html.matchAll(/RU=([^/]+)\/RK=/g)]
      .map((m) => decodeURIComponent(m[1]))
      .filter((u) => u.startsWith('http') && !u.includes('yahoo.com'));
    return [...new Set(urls)];
  } catch {
    return [];
  }
}

async function validateURL(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
}

/**
 * Resolves a single content item. Returns the chosen URL, or null if nothing
 * validated. Article/tool web search occasionally surfaces a YouTube result
 * (Yahoo doesn't restrict by domain) — when that happens we reclassify the
 * item's type to 'video' on the caller's copy rather than discarding a
 * perfectly good, already-validated link.
 */
async function resolveOne(item: ContentItem): Promise<string | null> {
  const queries = [item.search_query, broaden(item.search_query)].filter(
    (q, i, arr) => q && arr.indexOf(q) === i
  );
  for (const q of queries) {
    const candidates =
      item.type === 'video' ? await searchYouTube(q) : await searchWeb(q);
    for (const c of candidates) {
      if (item.type === 'video') return c; // YouTube IDs are reliable
      if (await validateURL(c)) {
        if (c.includes('youtube.com') || c.includes('youtu.be')) {
          item.type = 'video';
        }
        return c;
      }
    }
    await sleep(item.type === 'video' ? 400 : 800);
  }
  return null;
}

async function main() {
  const seedPath = path.join(process.cwd(), 'stacked_goals_seed.json');
  const data: SeedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const unresolved: any[] = [];
  let checked = 0;
  let resolved = 0;

  for (const goal of data.goals) {
    for (const step of goal.steps) {
      for (const item of step.content) {
        if (item.verified && item.url) continue;
        checked++;
        console.log(`Retry [${item.type}] ${goal.slug} step ${step.step_number}: ${item.search_query}`);
        const url = await resolveOne(item);
        if (url) {
          item.url = url;
          item.verified = true;
          resolved++;
          console.log(`  ✓ ${url}`);
        } else {
          unresolved.push({
            goal_slug: goal.slug,
            step_number: step.step_number,
            type: item.type,
            brief: item.brief,
            search_query: item.search_query,
          });
        }
        if (checked % 10 === 0) console.log(`  …${checked} checked, ${resolved} resolved`);
      }
    }
  }

  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'unresolved.json'),
    JSON.stringify({ count: unresolved.length, items: unresolved }, null, 2)
  );

  console.log('\n=== retry-unresolved complete ===');
  console.log(`Checked:    ${checked}`);
  console.log(`Resolved:   ${resolved}`);
  console.log(`Unresolved: ${unresolved.length} (→ scripts/unresolved.json; covered by fallback guides)`);
  console.log('Run `npx tsx scripts/seed-catalogue.ts` to push newly resolved links.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
