import { create } from 'zustand';

export type OnboardingAnswers = {
  financeFrequency?: string;
  lifeGoal?: string;
  ageGroup?: string;
  lastControl?: string;
  resonatingWord?: string;
  moneyHabits?: string[];
  downloadReason?: string;
  email?: string;
};

type OnboardingStore = {
  answers: OnboardingAnswers;
  setAnswer: (key: keyof OnboardingAnswers, value: string | string[]) => void;
  clearAnswers: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  answers: {},
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
  clearAnswers: () => set({ answers: {} }),
}));
