import { getGoalById, GOALS, type Goal } from '@/data/goals';
import type { Scores } from '@/lib/calculateScores';

/** Each weak dimension points at the free goal best suited to lift it. */
const DIMENSION_TO_GOAL: Record<keyof Omit<Scores, 'overall'>, string> = {
  investmentReadiness: 'start-investing',
  discipline: 'master-budgeting',
  clarity: 'get-out-of-debt',
  moneyMindset: 'understand-credit-scores',
  focus: 'build-an-emergency-fund',
};

/**
 * Picks the goal that targets the user's lowest Stack Score dimension (the
 * "Recommended for you" strip). Falls back to the top-weighted free goal when
 * we have no scores yet.
 */
export function recommendedGoal(scores: Scores | null): Goal {
  if (scores) {
    const dims = Object.keys(DIMENSION_TO_GOAL) as (keyof typeof DIMENSION_TO_GOAL)[];
    const weakest = dims.reduce((lowest, dim) =>
      scores[dim] < scores[lowest] ? dim : lowest,
    );
    const goal = getGoalById(DIMENSION_TO_GOAL[weakest]);
    if (goal && !goal.isPremium) return goal;
  }
  return [...GOALS].filter((g) => !g.isPremium).sort((a, b) => b.sortWeight - a.sortWeight)[0];
}
