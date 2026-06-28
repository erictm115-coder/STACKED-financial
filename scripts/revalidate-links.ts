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
  console.log('Starting link revalidation...');
  
  // Define cutoff for 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffStr = thirtyDaysAgo.toISOString();

  // Query links older than 30 days or never checked
  const { data: items, error: queryError } = await supabaseAdmin
    .from('step_content')
    .select('id, url, brief, verified')
    .or(`last_checked.lt.${cutoffStr},last_checked.is.null`);

  if (queryError) {
    console.error('Failed to query links from database:', queryError.message);
    process.exit(1);
  }

  if (!items || items.length === 0) {
    console.log('No links require revalidation at this time.');
    return;
  }

  console.log(`Found ${items.length} content items to revalidate.`);
  
  let validCount = 0;
  let deadCount = 0;

  for (const item of items) {
    if (!item.url) {
      continue;
    }

    console.log(`Checking link for "${item.brief}": ${item.url}...`);
    const isValid = await validateURL(item.url);
    
    if (isValid) {
      console.log('  [Live] Link is active.');
      validCount++;
      
      const { error: updateError } = await supabaseAdmin
        .from('step_content')
        .update({
          last_checked: new Date().toISOString(),
          verified: true
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('  [Error] Failed to update link status:', updateError.message);
      }
    } else {
      console.warn(`  [DEAD] Link failed validation! Flagging as unverified.`);
      deadCount++;

      const { error: updateError } = await supabaseAdmin
        .from('step_content')
        .update({
          last_checked: new Date().toISOString(),
          verified: false
        })
        .eq('id', item.id);

      if (updateError) {
        console.error('  [Error] Failed to flag dead link:', updateError.message);
      }
    }
  }

  console.log('\nRevalidation summary:');
  console.log(`Total checked: ${items.length}`);
  console.log(`Live links: ${validCount}`);
  console.log(`Dead links flagged: ${deadCount}`);
}

main().catch(err => {
  console.error('Fatal revalidation error:', err);
  process.exit(1);
});
