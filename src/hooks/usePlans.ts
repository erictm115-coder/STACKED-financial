import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useAppStore } from '@/store/appStore';

export interface UserPlan {
  id: string;
  status: string;
  created_at: string;
  goal_id: string;
  goals: {
    id: string;
    slug: string;
    title: string;
    stream: string;
    icon_key: string;
  };
  user_step_progress: {
    id: string;
    completed: boolean;
    step_id: string;
  }[];
}

export function usePlans() {
  const { user } = useAuth();
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [savedGoals, setSavedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlansAndSaves = useCallback(async () => {
    if (!user) {
      setUserPlans([]);
      setSavedGoals([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch user plans (without step progress to avoid missing direct FK relationship error)
      const { data: plansData, error: plansErr } = await supabase
        .from('user_plans')
        .select(`
          id, status, created_at, goal_id,
          goals (id, slug, title, stream, icon_key)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (plansErr) throw plansErr;

      // 2. Fetch saved goals
      const { data: savedData, error: savedErr } = await supabase
        .from('saved_goals')
        .select('goal_id')
        .eq('user_id', user.id);

      if (savedErr) throw savedErr;

      // 3. Fetch user step progress and include goal_steps (goal_id) to map them in memory
      const { data: progressData, error: progressErr } = await supabase
        .from('user_step_progress')
        .select(`
          id, completed, step_id,
          goal_steps (goal_id)
        `)
        .eq('user_id', user.id);

      if (progressErr) throw progressErr;

      // 4. Map progress to user plans
      const plansWithProgress = (plansData || []).map((plan: any) => {
        const associatedProgress = (progressData || [])
          .filter((p: any) => p.goal_steps?.goal_id === plan.goal_id)
          .map((p: any) => ({
            id: p.id,
            completed: p.completed,
            step_id: p.step_id,
          }));

        return {
          ...plan,
          user_step_progress: associatedProgress,
        };
      });

      setUserPlans(plansWithProgress);
      setSavedGoals((savedData || []).map((s) => s.goal_id));
    } catch (err: any) {
      console.error('Error fetching plans/saves:', err);
      setError(err.message || 'Failed to fetch plans and saves.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlansAndSaves();
  }, [fetchPlansAndSaves]);

  // Helper to map frontend slug goalId to database UUID
  const getDbGoalId = async (goalId: string): Promise<string | null> => {
    const goals = useAppStore.getState().goals;
    const goal = goals.find((g) => g.id === goalId);
    if (goal?.databaseId) return goal.databaseId;

    // Fallback: query database directly
    const { data, error } = await supabase
      .from('goals')
      .select('id')
      .eq('slug', goalId)
      .maybeSingle();
    
    if (error) {
      console.error('Error finding goal by slug:', error.message);
    }
    return data?.id || null;
  };

  const createPlan = useCallback(async (goalId: string) => {
    if (!user) return { planId: null, error: 'Not authenticated' };

    const dbGoalId = await getDbGoalId(goalId);
    if (!dbGoalId) {
      return { planId: null, error: 'Goal not found' };
    }
    
    // 1. Check if plan already exists
    const { data: existing } = await supabase
      .from('user_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('goal_id', dbGoalId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return { planId: existing.id, error: null };
    }

    // 2. Insert new plan
    const { data: newPlan, error: insertErr } = await supabase
      .from('user_plans')
      .insert({ user_id: user.id, goal_id: dbGoalId, status: 'active' })
      .select('id')
      .single();

    if (insertErr) {
      return { planId: null, error: insertErr.message };
    }

    // Refresh local lists so My Plans tab is up-to-date before caller navigates
    await fetchPlansAndSaves();

    return { planId: newPlan.id, error: null };
  }, [user, fetchPlansAndSaves]);

  const savePlan = useCallback(async (goalId: string) => {
    if (!user) return;
    const dbGoalId = await getDbGoalId(goalId);
    if (!dbGoalId) return;

    try {
      const { error } = await supabase
        .from('saved_goals')
        .insert({ user_id: user.id, goal_id: dbGoalId });
      if (error) throw error;
      setSavedGoals((prev) => [...prev, dbGoalId]);
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  }, [user]);

  const unsavePlan = useCallback(async (goalId: string) => {
    if (!user) return;
    const dbGoalId = await getDbGoalId(goalId);
    if (!dbGoalId) return;

    try {
      const { error } = await supabase
        .from('saved_goals')
        .delete()
        .eq('user_id', user.id)
        .eq('goal_id', dbGoalId);
      if (error) throw error;
      setSavedGoals((prev) => prev.filter((id) => id !== dbGoalId));
    } catch (err) {
      console.error('Error unsaving goal:', err);
    }
  }, [user]);

  const deletePlan = useCallback(async (planId: string) => {
    if (!user) return;
    try {
      /*
       * BUG FIX:
       * The delete operation was failing because Row Level Security (RLS) is enabled on user_plans
       * and user_step_progress, but there were no DELETE policies defined for them.
       * Added missing DELETE policies in the database schema to fix it.
       */
      // Find plan first to retrieve its goal_id before deleting
      const plan = userPlans.find((p) => p.id === planId);

      const { error } = await supabase
        .from('user_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);
      if (error) throw error;

      // Actively filter out the deleted plan from local UI state immediately
      setUserPlans((prev) => prev.filter((p) => p.id !== planId));

      if (plan) {
        const dbGoalId = plan.goal_id;
        const { data: steps } = await supabase
          .from('goal_steps')
          .select('id')
          .eq('goal_id', dbGoalId);
        
        if (steps && steps.length > 0) {
          const stepIds = steps.map((s) => s.id);
          await supabase
            .from('user_step_progress')
            .delete()
            .eq('user_id', user.id)
            .in('step_id', stepIds);
        }
      }

      await fetchPlansAndSaves();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  }, [user, userPlans, fetchPlansAndSaves]);

  const isSaved = useCallback((goalId: string) => {
    // Check by slug first (which is goalId), or by database UUID
    const goals = useAppStore.getState().goals;
    const goal = goals.find((g) => g.id === goalId);
    const dbGoalId = goal?.databaseId || goalId;
    return savedGoals.includes(dbGoalId);
  }, [savedGoals]);

  const isActive = useCallback((goalId: string) => {
    const goals = useAppStore.getState().goals;
    const goal = goals.find((g) => g.id === goalId);
    const dbGoalId = goal?.databaseId || goalId;
    return userPlans.some((p) => p.goal_id === dbGoalId && p.status === 'active');
  }, [userPlans]);

  const isCompleted = useCallback((goalId: string) => {
    const goals = useAppStore.getState().goals;
    const goal = goals.find((g) => g.id === goalId);
    const dbGoalId = goal?.databaseId || goalId;
    return userPlans.some((p) => p.goal_id === dbGoalId && p.status === 'completed');
  }, [userPlans]);

  return {
    createPlan,
    savePlan,
    unsavePlan,
    deletePlan,
    isSaved,
    isActive,
    isCompleted,
    userPlans,
    savedGoals,
    isLoading,
    error,
    refresh: fetchPlansAndSaves,
  };
}
