import type { OnboardingAnswers } from '@/store/onboardingStore';

export type Scores = {
  overall: number;
  moneyMindset: number;
  clarity: number;
  discipline: number;
  focus: number;
  investmentReadiness: number;
};

const clamp = (v: number) => Math.min(70, Math.max(20, Math.round(v)));

/**
 * Maps questionnaire answers to scores (0-100). Simplified heuristic —
 * refine once we have real outcome data to calibrate against.
 */
export function calculateScores(answers: OnboardingAnswers): Scores {
  let overall = 50;
  let mindset = 51;
  let clarity = 64;
  let discipline = 40;
  let focus = 53;
  let investment = 41;

  if (answers.financeFrequency === 'Every day — it stresses me out') mindset -= 10;
  if (answers.financeFrequency === 'Never') {
    mindset -= 20;
    discipline -= 15;
  }
  if (answers.financeFrequency === 'A few times a week') mindset += 5;

  if (answers.resonatingWord === 'Trapped') {
    clarity -= 10;
    focus -= 8;
  }
  if (answers.resonatingWord === 'Motivated') {
    mindset += 15;
    focus += 10;
  }
  if (answers.resonatingWord === 'Ready') {
    mindset += 10;
    discipline += 8;
  }
  if (answers.resonatingWord === 'Stressed') discipline -= 12;

  const habits = answers.moneyHabits ?? [];
  if (habits.includes('Not investing anything')) investment -= 15;
  if (habits.includes('No budget or savings plan')) discipline -= 12;
  if (habits.includes('Impulse buying')) discipline -= 8;

  if (answers.lastControl === "I'm not sure I ever have…") {
    clarity -= 15;
    overall -= 8;
  }
  if (answers.lastControl === 'This week') {
    clarity += 10;
    overall += 8;
  }

  return {
    overall: clamp(overall),
    moneyMindset: clamp(mindset),
    clarity: clamp(clarity),
    discipline: clamp(discipline),
    focus: clamp(focus),
    investmentReadiness: clamp(investment),
  };
}

/** Potential scores are always current + a fixed uplift per dimension, capped at 99. */
export function calculatePotentialScores(current: Scores): Scores {
  return {
    overall: Math.min(99, current.overall + 48),
    moneyMindset: Math.min(99, current.moneyMindset + 48),
    clarity: Math.min(99, current.clarity + 32),
    discipline: Math.min(99, current.discipline + 58),
    focus: Math.min(99, current.focus + 46),
    investmentReadiness: Math.min(99, current.investmentReadiness + 56),
  };
}
