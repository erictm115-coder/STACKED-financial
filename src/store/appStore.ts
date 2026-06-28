import { create } from 'zustand';

/**
 * Client-side app state for the main product. Currently in-memory only;
 * wire to Supabase (saved_goals / user_plans) in the persistence milestone.
 */
type AppStore = {
  /** Goal ids the user has bookmarked. */
  savedGoalIds: string[];
  toggleSaved: (goalId: string) => void;
  isSaved: (goalId: string) => boolean;
};

export const useAppStore = create<AppStore>((set, get) => ({
  savedGoalIds: [],
  toggleSaved: (goalId) =>
    set((state) => ({
      savedGoalIds: state.savedGoalIds.includes(goalId)
        ? state.savedGoalIds.filter((id) => id !== goalId)
        : [...state.savedGoalIds, goalId],
    })),
  isSaved: (goalId) => get().savedGoalIds.includes(goalId),
}));
