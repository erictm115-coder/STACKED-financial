import { create } from 'zustand';

import type { Scores } from '@/lib/calculateScores';

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
  /** Current (low) score set — saved on results.tsx so potential.tsx can derive from it without refetching. */
  scores: Scores | null;
  setScores: (scores: Scores) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  answers: {},
  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),
  clearAnswers: () => set({ answers: {} }),
  scores: null,
  setScores: (scores) => set({ scores }),
}));
