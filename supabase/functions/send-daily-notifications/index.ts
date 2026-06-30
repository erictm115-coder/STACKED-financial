import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Copy bank variants for edge function execution
interface NotificationVariant {
  id: string;
  category: 'streak' | 'curiosity' | 'identity' | 'specific' | 'loss_aversion' | 'soft';
  title: string;
  body: string;
}

const NOTIFICATION_BANK: NotificationVariant[] = [
  { id: 'streak_1', category: 'streak', title: 'Stacked', body: 'Your streak is waiting on you 🔥' },
  { id: 'streak_2', category: 'streak', title: 'Stacked', body: "Don't break the chain — 1 step keeps it alive" },
  { id: 'streak_3', category: 'streak', title: 'Stacked', body: 'Your stack is one tap from growing today' },
  { id: 'curiosity_1', category: 'curiosity', title: 'Stacked', body: 'Your Stack Score moved this week. See what changed.' },
  { id: 'curiosity_2', category: 'curiosity', title: 'Stacked', body: "Someone in your league just levelled up. You're close too." },
  { id: 'identity_1', category: 'identity', title: 'Stacked', body: 'Wealthy people did one small thing today. Did you?' },
  { id: 'identity_2', category: 'identity', title: 'Stacked', body: '5 minutes today = closer to financial freedom' },
  { id: 'soft_1', category: 'soft', title: 'Stacked', body: 'No pressure — your plan is right where you left it' },
  { id: 'soft_2', category: 'soft', title: 'Stacked', body: '2 minutes is all it takes to keep stacking' },
  { id: 'loss_1', category: 'loss_aversion', title: 'Stacked', body: 'Your streak resets at midnight' },
];

serve(async (req) => {
  // This function fans out push notifications to EVERY user, so it must only be
  // callable by the scheduler — never by a client. The anon key ships inside the
  // app and is therefore public, so JWT verification alone is not enough. Require
  // a shared secret that only the cron job knows.
  //   Set it:    supabase secrets set CRON_SECRET=<random-long-string>
  //   Send it:   header  x-cron-secret: <same-string>  on the scheduled call.
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase credentials not configured in Edge Function environment' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    // 1. Fetch users with push notifications enabled and valid token
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, expo_push_token')
      .eq('daily_stack_reminder', true)
      .not('expo_push_token', 'is', null);

    if (userError) throw userError;

    const results = [];

    for (const userProfile of users || []) {
      const userId = userProfile.id;
      const pushToken = userProfile.expo_push_token;

      // 2. Fetch active plans with progress details
      const { data: activePlansData, error: plansErr } = await supabase
        .from('user_plans')
        .select(`
          id,
          goal_id,
          created_at,
          goals (id, title)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (plansErr) {
        console.error(`Error fetching plans for user ${userId}:`, plansErr.message);
        continue;
      }

      const activePlans = [];

      for (const p of activePlansData || []) {
        const goalId = p.goal_id;
        const goalTitle = p.goals?.title || 'your plan';

        // Count total steps
        const { count: totalSteps } = await supabase
          .from('goal_steps')
          .select('id', { count: 'exact', head: true })
          .eq('goal_id', goalId);

        // Count completed steps
        const { data: steps } = await supabase
          .from('goal_steps')
          .select('id, step_number')
          .eq('goal_id', goalId);

        let completedSteps = 0;
        let nextStepNumber = 1;
        let nextStepMinutes = 5;

        if (steps && steps.length > 0) {
          const stepIds = steps.map(s => s.id);
          const { data: progress } = await supabase
            .from('user_step_progress')
            .select('step_id, completed')
            .eq('user_id', userId)
            .in('step_id', stepIds);

          const completedMap = new Set(progress?.filter(pr => pr.completed).map(pr => pr.step_id) || []);
          completedSteps = completedMap.size;

          const nextStep = steps
            .sort((a, b) => a.step_number - b.step_number)
            .find(s => !completedMap.has(s.id));

          if (nextStep) {
            nextStepNumber = nextStep.step_number;
            const { data: content } = await supabase
              .from('step_content')
              .select('est_minutes')
              .eq('step_id', nextStep.id)
              .limit(1)
              .maybeSingle();
            
            if (content?.est_minutes) {
              nextStepMinutes = content.est_minutes;
            }
          }
        }

        activePlans.push({
          planId: p.id,
          goalId,
          goalTitle,
          totalSteps: totalSteps || 5,
          completedSteps,
          lastActivity: p.created_at,
          nextStepNumber,
          nextStepMinutes
        });
      }

      // 3. Selection logic
      let selected: NotificationVariant | null = null;

      // Check specific dynamic variants
      const nearlyDone = activePlans.find(p => p.completedSteps === p.totalSteps - 1);
      if (nearlyDone) {
        selected = {
          id: 'specific_nearly_done',
          category: 'specific',
          title: 'Stacked',
          body: `You're 1 step from completing ${nearlyDone.goalTitle} 🎯`,
        };
      } else {
        const leastRecent = [...activePlans].sort((a, b) =>
          new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
        )[0];
        if (leastRecent) {
          selected = {
            id: 'specific_resume',
            category: 'specific',
            title: 'Stacked',
            body: `Step ${leastRecent.nextStepNumber} of ${leastRecent.goalTitle} is waiting — ~${leastRecent.nextStepMinutes} min`,
          };
        }
      }

      // Check if we should fallback or select from copy bank
      // Math.random() > 0.3 means we prefer specific 70% of the time. If no specific exists, we use copy bank.
      if (!selected || Math.random() <= 0.3) {
        // Fetch recently sent notifications in last 7 days to avoid repeats
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentLogs } = await supabase
          .from('notification_log')
          .select('notification_id, category')
          .eq('user_id', userId)
          .gt('sent_at', sevenDaysAgo.toISOString());

        const recentlyUsedIds = (recentLogs || []).map(log => log.notification_id);
        const hasLossAversionRecently = (recentLogs || []).some(log => log.category === 'loss_aversion');

        let eligible = NOTIFICATION_BANK.filter(n => !recentlyUsedIds.includes(n.id));
        if (hasLossAversionRecently) {
          eligible = eligible.filter(n => n.category !== 'loss_aversion');
        }

        const pool = eligible.length > 0 ? eligible : NOTIFICATION_BANK;
        selected = pool[Math.floor(Math.random() * pool.length)];
      }

      // 4. Send Expo Push notification
      try {
        const pushRes = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: pushToken,
            title: selected.title,
            body: selected.body,
            sound: 'default',
            data: { category: selected.category, id: selected.id }
          })
        });

        const pushData = await pushRes.json();
        
        // 5. Log to database
        const { error: logErr } = await supabase
          .from('notification_log')
          .insert({
            user_id: userId,
            notification_id: selected.id,
            category: selected.category
          });

        if (logErr) {
          console.error(`Error logging notification for user ${userId}:`, logErr.message);
        }

        results.push({
          userId,
          status: 'sent',
          notification_id: selected.id,
          expoResponse: pushData
        });
      } catch (err: any) {
        console.error(`Failed to send push to user ${userId}:`, err.message);
        results.push({ userId, status: 'failed', error: err.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    console.error('Fatal Edge Function Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
