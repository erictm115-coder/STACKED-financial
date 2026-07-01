import { useOnboardingStore } from './onboardingStore';

describe('useOnboardingStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useOnboardingStore.getState().clearAnswers();
    useOnboardingStore.setState({ scores: null });
  });

  it('starts with empty answers and null scores', () => {
    const state = useOnboardingStore.getState();
    expect(state.answers).toEqual({});
    expect(state.scores).toBeNull();
  });

  it('sets an answer correctly', () => {
    useOnboardingStore.getState().setAnswer('financeFrequency', 'Never');
    expect(useOnboardingStore.getState().answers.financeFrequency).toBe('Never');
  });

  it('sets multiple answers and appends/overwrites correctly', () => {
    useOnboardingStore.getState().setAnswer('financeFrequency', 'Never');
    useOnboardingStore.getState().setAnswer('moneyHabits', ['Impulse buying']);
    
    const state = useOnboardingStore.getState();
    expect(state.answers.financeFrequency).toBe('Never');
    expect(state.answers.moneyHabits).toEqual(['Impulse buying']);
  });

  it('clears answers correctly', () => {
    useOnboardingStore.getState().setAnswer('financeFrequency', 'Never');
    useOnboardingStore.getState().clearAnswers();
    expect(useOnboardingStore.getState().answers).toEqual({});
  });

  it('sets scores correctly', () => {
    const scores = {
      overall: 50,
      moneyMindset: 50,
      clarity: 50,
      discipline: 50,
      focus: 50,
      investmentReadiness: 50,
    };
    useOnboardingStore.getState().setScores(scores);
    expect(useOnboardingStore.getState().scores).toEqual(scores);
  });
});
