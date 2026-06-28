import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { type Goal } from '@/data/goals';

type AppStore = {
  /** Live catalogue loaded from Supabase */
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  /** Goal ids the user has bookmarked */
  savedGoalIds: string[];
  
  toggleSaved: (goalId: string) => void;
  isSaved: (goalId: string) => boolean;
  fetchCatalog: () => Promise<void>;
  getGoalById: (id: string) => Goal | undefined;
};

export const useAppStore = create<AppStore>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,
  savedGoalIds: [],
  
  toggleSaved: (goalId) =>
    set((state) => ({
      savedGoalIds: state.savedGoalIds.includes(goalId)
        ? state.savedGoalIds.filter((id) => id !== goalId)
        : [...state.savedGoalIds, goalId],
    })),
    
  isSaved: (goalId) => get().savedGoalIds.includes(goalId),
  
  getGoalById: (id) => {
    return get().goals.find((g) => g.id === id);
  },

  fetchCatalog: async () => {
    if (get().goals.length > 0 && !get().error) {
      // Catalog already loaded
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Fetch goals, steps, and content concurrently
      const [goalsRes, stepsRes, contentRes] = await Promise.all([
        supabase.from('goals').select('*'),
        supabase.from('goal_steps').select('*'),
        supabase.from('step_content').select('*')
      ]);
      
      if (goalsRes.error) throw goalsRes.error;
      if (stepsRes.error) throw stepsRes.error;
      if (contentRes.error) throw contentRes.error;
      
      const goalsRows = goalsRes.data || [];
      const stepsRows = stepsRes.data || [];
      const contentRows = contentRes.data || [];
      
      // Map database rows to frontend camelCase types
      const mappedGoals: Goal[] = goalsRows.map((goalRow) => {
        const steps = stepsRows
          .filter((s) => s.goal_id === goalRow.id)
          .map((s) => {
            const content = contentRows
              .filter((c) => c.step_id === s.id)
              .map((c) => ({
                type: c.content_type as 'video' | 'article' | 'tool',
                title: c.title || c.brief || '',
                url: c.url || '',
                estMinutes: c.est_minutes || 0
              }));
              
            const scoreImpact: any = {};
            if (s.score_impact) {
              Object.entries(s.score_impact).forEach(([key, val]) => {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                scoreImpact[camelKey] = val;
              });
            }
            
            return {
              stepNumber: s.step_number,
              title: s.title,
              whyItMatters: s.why_it_matters || '',
              actionItems: s.action_items || [],
              content,
              scoreImpact
            };
          })
          .sort((a, b) => a.stepNumber - b.stepNumber);
          
        return {
          id: goalRow.slug, // Set frontend id as slug to match router params
          databaseId: goalRow.id,
          title: goalRow.title,
          stream: goalRow.stream as any,
          category: goalRow.category as any,
          difficulty: goalRow.difficulty as any,
          estDuration: goalRow.est_duration,
          isPremium: goalRow.is_premium,
          iconKey: goalRow.icon_key,
          sortWeight: goalRow.sort_weight || 0,
          steps
        };
      }).sort((a, b) => b.sortWeight - a.sortWeight);
      
      set({ goals: mappedGoals, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching Supabase catalog:', err.message);
      set({ error: err.message, isLoading: false });
    }
  }
}));
