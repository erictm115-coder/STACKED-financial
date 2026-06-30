export interface NotificationVariant {
  id: string;
  category: 'streak' | 'curiosity' | 'identity' | 'specific' | 'loss_aversion' | 'soft';
  title: string;
  body: string;
}

export const NOTIFICATION_BANK: NotificationVariant[] = [
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

export function getSpecificNotification(activePlans: any[]): NotificationVariant | null {
  const nearlyDone = activePlans.find(p => p.completedSteps === p.totalSteps - 1);
  if (nearlyDone) {
    return {
      id: 'specific_nearly_done',
      category: 'specific',
      title: 'Stacked',
      body: `You're 1 step from completing ${nearlyDone.goalTitle} 🎯`,
    };
  }

  const leastRecent = [...activePlans].sort((a, b) =>
    new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
  )[0];
  if (leastRecent) {
    return {
      id: 'specific_resume',
      category: 'specific',
      title: 'Stacked',
      body: `Step ${leastRecent.nextStepNumber} of ${leastRecent.goalTitle} is waiting — ~${leastRecent.nextStepMinutes} min`,
    };
  }

  return null;
}
