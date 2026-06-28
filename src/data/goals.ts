/**
 * Static goal catalogue. Mirrors the `public.goals` schema (see Stacked
 * architecture doc, Part 4) so we can swap this for a Supabase fetch later
 * without changing the screens that consume it.
 */

export type GoalCategory = 'debt' | 'investing' | 'saving' | 'budgeting' | 'income';
export type GoalDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type GoalStream = 'money_foundations' | 'income_builders' | 'wealthy_habits';

/** Stack Score dimensions a step can raise (matches calculateScores). */
export type ScoreDimension =
  | 'moneyMindset'
  | 'clarity'
  | 'discipline'
  | 'focus'
  | 'investmentReadiness';

export type StepContent = {
  type: 'video' | 'article' | 'tool';
  title: string;
  url: string;
  estMinutes: number;
};

export type GoalStep = {
  stepNumber: number;
  title: string;
  whyItMatters: string;
  content: StepContent[];
  actionItems: string[];
  /** Which Stack Score dimensions completing this step raises, and by how much. */
  scoreImpact: Partial<Record<ScoreDimension, number>>;
};

export type Goal = {
  id: string;
  databaseId?: string;
  title: string;
  /** Which catalogue stream this goal belongs to (drives Discover grouping). */
  stream?: GoalStream;
  category: GoalCategory;
  difficulty: GoalDifficulty;
  /** Human-readable estimate, e.g. "~3 wks". Null for premium teasers. */
  estDuration: string | null;
  isPremium: boolean;
  /** Maps to a lucide icon in the UI layer (keeps data free of components). */
  iconKey: string;
  sortWeight: number;
  steps: GoalStep[];
};

export const GOALS: Goal[] = [
  {
    id: 'get-out-of-debt',
    title: 'Get Out of Debt',
    category: 'debt',
    difficulty: 'beginner',
    estDuration: '~3 wks',
    isPremium: false,
    iconKey: 'debt',
    sortWeight: 100,
    steps: [
      {
        stepNumber: 1,
        title: 'Understand Your Total Debt Picture',
        whyItMatters:
          'You can only beat what you can see. Listing every balance turns a vague dread into a plan you can act on.',
        content: [
          {
            type: 'video',
            title: 'How to list all your debts in 10 minutes',
            url: 'https://www.youtube.com/results?search_query=list+all+your+debts',
            estMinutes: 8,
          },
        ],
        actionItems: [
          'Write down every debt, balance, and interest rate',
          'Add up your total owed',
        ],
        scoreImpact: { clarity: 2, moneyMindset: 1 },
      },
      {
        stepNumber: 2,
        title: 'Choose a Payoff Strategy',
        whyItMatters:
          'Picking the right method keeps you motivated and can save you hundreds in interest.',
        content: [
          {
            type: 'video',
            title: 'Snowball vs Avalanche — which clears debt faster?',
            url: 'https://www.youtube.com/results?search_query=snowball+vs+avalanche',
            estMinutes: 6,
          },
          {
            type: 'article',
            title: 'How I cleared €30k of debt in 18 months',
            url: 'https://www.google.com/search?q=how+i+cleared+30k+debt',
            estMinutes: 4,
          },
        ],
        actionItems: [
          'List your debts highest-interest first',
          'Pick snowball or avalanche',
        ],
        scoreImpact: { discipline: 2, clarity: 1 },
      },
      {
        stepNumber: 3,
        title: 'Cut & Redirect Unnecessary Spending',
        whyItMatters:
          'Every euro you redirect to debt is a euro that stops costing you interest every single month.',
        content: [
          {
            type: 'tool',
            title: 'Subscription audit checklist',
            url: 'https://www.google.com/search?q=subscription+audit+checklist',
            estMinutes: 5,
          },
        ],
        actionItems: [
          'Cancel one subscription you forgot you had',
          'Redirect that amount to your highest-priority debt',
        ],
        scoreImpact: { discipline: 2, focus: 1 },
      },
      {
        stepNumber: 4,
        title: 'Negotiate Your Interest Rates',
        whyItMatters:
          'A single phone call can lower your rate — most people never ask, and it costs them thousands.',
        content: [
          {
            type: 'article',
            title: 'The script that lowers your credit card APR',
            url: 'https://www.google.com/search?q=script+to+lower+credit+card+apr',
            estMinutes: 4,
          },
        ],
        actionItems: ['Call one lender and ask for a lower rate'],
        scoreImpact: { moneyMindset: 2, clarity: 1 },
      },
      {
        stepNumber: 5,
        title: 'Build Your Debt-Free Timeline',
        whyItMatters:
          'A real date on the calendar turns "someday" into a countdown you can actually feel.',
        content: [
          {
            type: 'tool',
            title: 'Debt payoff date calculator',
            url: 'https://www.google.com/search?q=debt+payoff+calculator',
            estMinutes: 5,
          },
        ],
        actionItems: [
          'Calculate your debt-free date at your current pace',
          'Set a reminder to review progress monthly',
        ],
        scoreImpact: { focus: 2, clarity: 1 },
      },
    ],
  },
  {
    id: 'start-investing',
    title: 'Start Investing',
    category: 'investing',
    difficulty: 'beginner',
    estDuration: '~2 wks',
    isPremium: false,
    iconKey: 'investing',
    sortWeight: 90,
    steps: [],
  },
  {
    id: 'save-for-a-house',
    title: 'Save for a House',
    category: 'saving',
    difficulty: 'intermediate',
    estDuration: null,
    isPremium: true,
    iconKey: 'saving',
    sortWeight: 60,
    steps: [],
  },
  {
    id: 'build-an-emergency-fund',
    title: 'Build an Emergency Fund',
    category: 'saving',
    difficulty: 'beginner',
    estDuration: '~2 wks',
    isPremium: false,
    iconKey: 'saving',
    sortWeight: 85,
    steps: [],
  },
  {
    id: 'master-budgeting',
    title: 'Master Budgeting',
    category: 'budgeting',
    difficulty: 'beginner',
    estDuration: '~1 wk',
    isPremium: false,
    iconKey: 'budgeting',
    sortWeight: 80,
    steps: [],
  },
  {
    id: 'start-a-side-hustle',
    title: 'Start a Side Hustle',
    category: 'income',
    difficulty: 'intermediate',
    estDuration: null,
    isPremium: true,
    iconKey: 'income',
    sortWeight: 55,
    steps: [],
  },
  {
    id: 'plan-early-retirement',
    title: 'Plan Early Retirement',
    category: 'investing',
    difficulty: 'advanced',
    estDuration: null,
    isPremium: true,
    iconKey: 'investing',
    sortWeight: 40,
    steps: [],
  },
  {
    id: 'understand-credit-scores',
    title: 'Understand Credit Scores',
    category: 'debt',
    difficulty: 'beginner',
    estDuration: '~1 wk',
    isPremium: false,
    iconKey: 'debt',
    sortWeight: 75,
    steps: [],
  },
  {
    id: 'stop-impulse-spending',
    title: 'Stop Impulse Spending',
    category: 'budgeting',
    difficulty: 'beginner',
    estDuration: '~1 wk',
    isPremium: false,
    iconKey: 'budgeting',
    sortWeight: 70,
    steps: [],
  },
  {
    id: 'hit-first-10k-saved',
    title: 'Hit Your First €10k Saved',
    category: 'saving',
    difficulty: 'intermediate',
    estDuration: '~6 mo',
    isPremium: false,
    iconKey: 'saving',
    sortWeight: 65,
    steps: [],
  },
];

export function getGoalById(id: string): Goal | undefined {
  return GOALS.find((g) => g.id === id);
}

const DIFFICULTY_LABEL: Record<GoalDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** "Beginner · ~3 wks" / "Intermediate" when no duration. */
export function goalMetaLabel(goal: Goal): string {
  const difficulty = DIFFICULTY_LABEL[goal.difficulty];
  return goal.estDuration ? `${difficulty} · ${goal.estDuration}` : difficulty;
}
