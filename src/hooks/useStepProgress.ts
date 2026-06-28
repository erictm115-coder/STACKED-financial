import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface StepProgress {
  id: string;
  step_id: string;
  completed: boolean;
  checked_items: number[];
  score_impact: any;
}

export function useStepProgress(
  planId: string,
  stepIds: string[],
  stepsMap: Record<string, { action_items: string[]; score_impact: any }>
) {
  const { user } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, StepProgress>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user || stepIds.length === 0) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_step_progress')
        .select('*')
        .in('step_id', stepIds)
        .eq('user_id', user.id);

      if (error) throw error;

      const map: Record<string, StepProgress> = {};
      (data || []).forEach((row) => {
        map[row.step_id] = {
          id: row.id,
          step_id: row.step_id,
          completed: row.completed,
          checked_items: row.checked_items || [],
          score_impact: row.score_impact,
        };
      });
      setProgressMap(map);
    } catch (err) {
      console.error('Error fetching step progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, JSON.stringify(stepIds)]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleActionItem = async (
    stepId: string,
    itemIndex: number,
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void
  ) => {
    if (!user) return;

    let progress = progressMap[stepId] ?? null;

    // 1. Get or create progress row for this step
    if (!progress) {
      const { data, error } = await supabase
        .from('user_step_progress')
        .insert({
          user_id: user.id,
          step_id: stepId,
          completed: false,
          checked_items: [],
          score_impact: null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating step progress:', error.message);
        return;
      }
      progress = {
        id: data.id,
        step_id: data.step_id,
        completed: data.completed,
        checked_items: data.checked_items || [],
        score_impact: data.score_impact,
      };
    }

    // 2. Toggle the item in the checked_items array
    const currentChecked = progress.checked_items ?? [];
    const newChecked = currentChecked.includes(itemIndex)
      ? currentChecked.filter(i => i !== itemIndex)
      : [...currentChecked, itemIndex];

    // 3. Get total action items count for this step
    const step = stepsMap[stepId];
    if (!step) return;
    const totalItems = step.action_items.length;
    const allDone = newChecked.length >= totalItems;

    // Optimistic UI update
    setProgressMap((prev) => ({
      ...prev,
      [stepId]: {
        ...progress!,
        checked_items: newChecked,
        completed: allDone,
      },
    }));

    try {
      // 4. Update progress row
      const { error: updateErr } = await supabase
        .from('user_step_progress')
        .update({
          checked_items: newChecked,
          completed: allDone,
          completed_at: allDone ? new Date().toISOString() : null,
          score_impact: allDone ? step.score_impact : null,
        })
        .eq('id', progress.id);

      if (updateErr) throw updateErr;

      // 5. If step just completed → trigger score update + celebration
      if (allDone && !progress.completed) {
        await handleStepComplete(stepId, step.score_impact, onStepCompleteAnimation);
      }
    } catch (err: any) {
      console.error('Failed to update action item progress:', err.message);
      // Revert optimistic update
      fetchProgress();
    }
  };

  const mapDimensionToColumn = (dim: string): string => {
    if (dim === 'moneyMindset') return 'money_mindset';
    if (dim === 'investmentReadiness') return 'investment_readiness';
    return dim;
  };

  const handleStepComplete = async (
    stepId: string,
    scoreImpact: Record<string, number>,
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void
  ) => {
    if (!user) return;
    try {
      // 1. Update Stack Score dimensions
      const { data: currentScore, error: scoreErr } = await supabase
        .from('stacked_scores')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (scoreErr) throw scoreErr;

      let scoresToUpdate = currentScore;
      if (!scoresToUpdate) {
        const { data: newScore, error: insertScoreErr } = await supabase
          .from('stacked_scores')
          .insert({
            user_id: user.id,
            overall: 0,
            money_mindset: 0,
            clarity: 0,
            discipline: 0,
            focus: 0,
            investment_readiness: 0,
          })
          .select()
          .single();
        if (insertScoreErr) throw insertScoreErr;
        scoresToUpdate = newScore;
      }

      /*
       * BUG FIX:
       * The scoreImpact object contains camelCase keys (e.g., moneyMindset, investmentReadiness).
       * However, the database table columns are defined in snake_case (money_mindset, investment_readiness).
       * We must map the dimensions to snake_case columns, otherwise Supabase throws a "column does not exist" error.
       */
      const updates: Record<string, number> = {};
      Object.entries(scoreImpact).forEach(([dimension, delta]) => {
        const dbColumn = mapDimensionToColumn(dimension);
        const current = scoresToUpdate[dbColumn] ?? 0;
        updates[dbColumn] = Math.min(99, current + delta);
      });
      
      const maxDelta = Math.max(...Object.values(scoreImpact));
      updates['overall'] = Math.min(99, (scoresToUpdate.overall ?? 0) + maxDelta);

      console.log('[handleStepComplete] Mutating stacked_scores. User ID:', user.id, 'step ID:', stepId, 'Payload:', updates);
      const { error: updateScoreErr } = await supabase
        .from('stacked_scores')
        .update(updates)
        .eq('user_id', user.id);

      if (updateScoreErr) throw updateScoreErr;
      console.log('[handleStepComplete] Mutation successful. User ID:', user.id, 'step ID:', stepId);

      // 2. Update gamification (streak + stacks)
      const { error: rpcErr } = await supabase.rpc('increment_stacks', { uid: user.id });
      if (rpcErr) throw rpcErr;

      // 3. Trigger celebration animation callback
      if (onStepCompleteAnimation) {
        onStepCompleteAnimation(scoreImpact);
      }
    } catch (err: any) {
      console.error('Failed to handle step completion:', err.message);
    }
  };

  const completePlan = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_plans')
        .update({ status: 'completed' })
        .eq('id', planId);

      if (error) throw error;
    } catch (err) {
      console.error('Error completing plan:', err);
    }
  };

  return {
    progressMap,
    isLoading,
    toggleActionItem,
    completePlan,
    refreshProgress: fetchProgress,
  };
}
