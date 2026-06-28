import * as fs from 'fs';
import * as path from 'path';

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

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function searchYahoo(query: string): Promise<string[]> {
  const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = [...html.matchAll(/RU=([^/]+)\/RK=/g)];
    const urls = matches
      .map(m => decodeURIComponent(m[1]))
      .filter(u => u.startsWith('http') && !u.includes('yahoo.com') && !u.includes('bing.com/aclick') && !u.includes('clickserve'));
    return [...new Set(urls)];
  } catch (err) {
    console.error(`  [Yahoo Error] ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

async function searchYouTube(query: string, apiKey: string): Promise<string[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=3&q=${encodeURIComponent(query)}&key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  [YouTube API Error] Status ${res.status}`);
      return [];
    }
    const data: any = await res.json();
    const videoIds = data.items?.map((item: any) => item.id?.videoId).filter(Boolean) || [];
    return videoIds.map((id: string) => `https://www.youtube.com/watch?v=${id}`);
  } catch (err) {
    console.error(`  [YouTube Error] ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

function scoreURL(url: string): number {
  const lower = url.toLowerCase();
  
  // Prefer reputable domains
  if (lower.includes('.gov')) return 100;
  if (lower.includes('investopedia.com')) return 90;
  if (lower.includes('nerdwallet.com')) return 80;
  if (lower.includes('moneysavingexpert.com')) return 70;
  if (lower.includes('fool.com') || lower.includes('themotleyfool.com')) return 60;
  
  // General reputable finance/news
  if (lower.includes('nytimes.com') || lower.includes('forbes.com') || lower.includes('cnbc.com') || lower.includes('wsj.com')) return 40;
  
  // Standard fallback
  return 10;
}

async function validateURL(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (res.ok) return true;
    
    if (res.status === 403 || res.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(5000)
      });
      return getRes.ok;
    }
    
    return false;
  } catch (err) {
    return false;
  }
}

async function main() {
  const seedPath = path.join(process.cwd(), 'stacked_goals_seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file stacked_goals_seed.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(seedPath, 'utf-8');
  const data: SeedData = JSON.parse(raw);

  const unresolved: any[] = [];
  let totalUnverified = 0;
  let resolvedCount = 0;

  console.log('Starting content resolution...');

  for (const goal of data.goals) {
    for (const step of goal.steps) {
      for (const content of step.content) {
        if (content.verified && content.url) {
          // Already verified, keep as is
          continue;
        }

        totalUnverified++;
        console.log(`Resolving [${content.type}] "${content.brief}" for goal "${goal.slug}" Step ${step.step_number}...`);
        
        let candidates: string[] = [];
        
        if (content.type === 'video') {
          if (YOUTUBE_API_KEY) {
            candidates = await searchYouTube(content.search_query, YOUTUBE_API_KEY);
            await sleep(500); // Throttling
          } else {
            console.log('  [Skip] No YouTube API key configured.');
          }
        } else {
          candidates = await searchYahoo(content.search_query);
          await sleep(1000); // Throttling for Yahoo Search
        }

        // Sort candidates based on domain reputation
        candidates.sort((a, b) => scoreURL(b) - scoreURL(a));

        let foundValid = false;
        for (const candidate of candidates) {
          console.log(`  Validating candidate: ${candidate}...`);
          const isValid = await validateURL(candidate);
          if (isValid) {
            console.log('  [Valid] Link verified.');
            content.url = candidate;
            content.verified = true;
            resolvedCount++;
            foundValid = true;
            break;
          } else {
            console.log('  [Invalid] Link failed validation.');
          }
        }

        if (!foundValid) {
          console.log('  [Failed] Could not resolve a valid URL.');
          unresolved.push({
            goal_slug: goal.slug,
            step_number: step.step_number,
            type: content.type,
            brief: content.brief,
            search_query: content.search_query
          });
        }
      }
    }
  }

  // Write updated seed data back
  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nResolution complete. Saved changes to stacked_goals_seed.json.`);
  console.log(`Total checked: ${totalUnverified}, Resolved: ${resolvedCount}, Unresolved: ${unresolved.length}`);

  // Write unresolved list
  const unresolvedPath = path.join(process.cwd(), 'unresolved.json');
  fs.writeFileSync(unresolvedPath, JSON.stringify(unresolved, null, 2), 'utf-8');
  console.log(`Logged unresolved links to unresolved.json`);

  if (!YOUTUBE_API_KEY && unresolved.some(i => i.type === 'video')) {
    console.log('\nNOTE: YouTube API key is required to resolve video links.');
  }
}

main();
