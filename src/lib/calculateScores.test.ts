import { calculateScores, calculatePotentialScores } from '@/lib/calculateScores';
import type { OnboardingAnswers } from '@/store/onboardingStore';

describe('calculateScores', () => {
  it('returns the baseline for empty answers', () => {
    expect(calculateScores({})).toEqual({
      overall: 50,
      moneyMindset: 51,
      clarity: 64,
      discipline: 40,
      focus: 53,
      investmentReadiness: 41,
    });
  });

  it('applies financeFrequency = "Never" deltas (mindset -20, discipline -15)', () => {
    const answers: OnboardingAnswers = { financeFrequency: 'Never' };
    const s = calculateScores(answers);
    expect(s.moneyMindset).toBe(31); // 51 - 20
    expect(s.discipline).toBe(25); // 40 - 15
    expect(s.overall).toBe(50); // untouched
  });

  it('applies resonatingWord = "Motivated" deltas (mindset +15, focus +10)', () => {
    const s = calculateScores({ resonatingWord: 'Motivated' });
    expect(s.moneyMindset).toBe(66); // 51 + 15
    expect(s.focus).toBe(63); // 53 + 10
  });

  it('clamps to a floor of 20 when deltas push a dimension below it', () => {
    // discipline: 40 -15 (Never) -12 (Stressed) -12 (No budget) -8 (Impulse) = -7 -> 20
    const answers: OnboardingAnswers = {
      financeFrequency: 'Never',
      resonatingWord: 'Stressed',
      moneyHabits: ['Not investing anything', 'No budget or savings plan', 'Impulse buying'],
    };
    const s = calculateScores(answers);
    expect(s.discipline).toBe(20);
    expect(s.investmentReadiness).toBe(26); // 41 - 15
  });

  it('clamps to a ceiling of 70 when deltas push a dimension above it', () => {
    // clarity: 64 + 10 (This week) = 74 -> 70; overall: 50 + 8 = 58
    const s = calculateScores({ lastControl: 'This week' });
    expect(s.clarity).toBe(70);
    expect(s.overall).toBe(58);
  });

  it('keeps every dimension within [20, 70] for any answer set', () => {
    const answers: OnboardingAnswers = {
      financeFrequency: 'Every day — it stresses me out',
      resonatingWord: 'Trapped',
      lastControl: "I'm not sure I ever have…",
      moneyHabits: ['Not investing anything', 'No budget or savings plan', 'Impulse buying'],
    };
    const s = calculateScores(answers);
    Object.values(s).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(20);
      expect(v).toBeLessThanOrEqual(70);
    });
  });
});

describe('calculatePotentialScores', () => {
  it('adds the per-dimension uplift on top of current scores', () => {
    const current = {
      overall: 30,
      moneyMindset: 30,
      clarity: 30,
      discipline: 30,
      focus: 30,
      investmentReadiness: 30,
    };
    const p = calculatePotentialScores(current);
    expect(p.overall).toBe(78); // 30 + 48
    expect(p.discipline).toBe(88); // 30 + 58
  });

  it('caps potential at 99', () => {
    const current = {
      overall: 70,
      moneyMindset: 70,
      clarity: 70,
      discipline: 70,
      focus: 70,
      investmentReadiness: 70,
    };
    const p = calculatePotentialScores(current);
    Object.values(p).forEach((v) => expect(v).toBeLessThanOrEqual(99));
    expect(p.overall).toBe(99); // 70 + 48 capped
  });
});
