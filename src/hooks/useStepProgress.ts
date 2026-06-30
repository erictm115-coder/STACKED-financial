import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Steps with an in-flight mutation — used to disable the UI and to guard
  // against rapid double-taps racing each other (Bug 1, cause E).
  const [busySteps, setBusySteps] = useState<Set<string>>(new Set());
  const inFlight = useRef<Set<string>>(new Set());

  const setBusy = (stepId: string, busy: boolean) => {
    setBusySteps((prev) => {
      const next = new Set(prev);
      if (busy) next.add(stepId);
      else next.delete(stepId);
      return next;
    });
  };

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
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void,
    onError?: (message: string) => void
  ) => {
    if (!user) return;

    // Race guard: ignore taps while a mutation for this step is in flight.
    if (inFlight.current.has(stepId)) return;
    inFlight.current.add(stepId);
    setBusy(stepId, true);

    // Snapshot for rollback on failure.
    const prev = progressMap[stepId] ? { ...progressMap[stepId] } : null;
    const prevChecked = prev?.checked_items ?? [];
    const prevCompleted = prev?.completed ?? false;

    try {
      let progress = prev;

      // 1. Get or create the progress row for this step.
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

        if (error) throw error;
        progress = {
          id: data.id,
          step_id: data.step_id,
          completed: data.completed,
          checked_items: data.checked_items || [],
          score_impact: data.score_impact,
        };
      }

      // 2. Toggle the item in the checked_items array.
      const currentChecked = progress.checked_items ?? [];
      const newChecked = currentChecked.includes(itemIndex)
        ? currentChecked.filter((i) => i !== itemIndex)
        : [...currentChecked, itemIndex];

      // 3. Determine completion.
      const step = stepsMap[stepId];
      if (!step) return;
      const totalItems = step.action_items.length;
      const allDone = totalItems > 0 && newChecked.length >= totalItems;
      const justCompleted = allDone && !prevCompleted;

      // Optimistic UI update.
      setProgressMap((p) => ({
        ...p,
        [stepId]: { ...progress!, checked_items: newChecked, completed: allDone },
      }));

      // 4. Persist the checkbox state.
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

      // 5. If the step just completed, run the score + gamification chain.
      //    handleStepComplete throws on failure so we can roll back below.
      if (justCompleted) {
        await handleStepComplete(stepId, step.score_impact, onStepCompleteAnimation);
      }
    } catch (err: any) {
      console.error('[toggleActionItem] Failed:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stepId,
        itemIndex,
      });

      // Roll back the optimistic state so a checkbox never appears ticked when
      // the write actually failed. Revert the DB row, then re-sync from DB.
      try {
        const rowId = progressMap[stepId]?.id ?? prev?.id;
        if (rowId) {
          await supabase
            .from('user_step_progress')
            .update({
              checked_items: prevChecked,
              completed: prevCompleted,
              completed_at: prevCompleted ? new Date().toISOString() : null,
              score_impact: prevCompleted ? stepsMap[stepId]?.score_impact ?? null : null,
            })
            .eq('id', rowId);
        }
      } catch (revertErr) {
        console.error('[toggleActionItem] Rollback also failed:', revertErr);
      }
      await fetchProgress();
      onError?.('Could not save your progress — please try again');
    } finally {
      inFlight.current.delete(stepId);
      setBusy(stepId, false);
    }
  };

  /**
   * Applies a completed step's score impact and, if it was the last step,
   * completes the plan. Both mutations run server-side in SECURITY DEFINER
   * functions (migration 006) that read the canonical score_impact from
   * goal_steps, are idempotent, and clamp to <= 99 — the client can no longer
   * write scores or stacks directly. Throws on failure so the caller can roll
   * back the optimistic UI.
   */
  const handleStepComplete = async (
    stepId: string,
    scoreImpact: Record<string, number>,
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void
  ) => {
    if (!user) return;
    try {
      // 1. Apply this step's score. Idempotent: a step scores at most once, so
      //    re-completing (uncheck -> recheck) will not re-add points.
      const { error: scoreErr } = await supabase.rpc('apply_step_score', {
        p_step_id: stepId,
      });
      if (scoreErr) throw scoreErr;

      // 2. Complete the plan + bump stacks, but only when every step is genuinely
      //    done. Ownership-checked and idempotent inside the function.
      const { error: planErr } = await supabase.rpc('complete_user_plan', {
        p_plan_id: planId,
      });
      if (planErr) throw planErr;

      // 3. Celebration callback (uses the catalogue score_impact for the badge).
      if (onStepCompleteAnimation) {
        onStepCompleteAnimation(scoreImpact);
      }
    } catch (err: any) {
      console.error('[handleStepComplete] Failed:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stepId,
        scoreImpact,
      });
      // Rethrow so toggleActionItem rolls back and surfaces a toast.
      throw err;
    }
  };

  const completePlan = async () => {
    if (!user) return;
    try {
      // Server-side: completes only if all steps are done, bumps stacks once.
      const { error } = await supabase.rpc('complete_user_plan', { p_plan_id: planId });
      if (error) throw error;
    } catch (err: any) {
      console.error('Error completing plan:', err);
      throw err;
    }
  };

  const isStepBusy = (stepId: string) => busySteps.has(stepId);

  return {
    progressMap,
    isLoading,
    toggleActionItem,
    completePlan,
    refreshProgress: fetchProgress,
    isStepBusy,
  };
}
