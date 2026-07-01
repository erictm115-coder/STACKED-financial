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

  const handleStepComplete = useCallback(async (
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
  }, [user, planId]);

  const timeoutMap = useRef<Record<string, NodeJS.Timeout>>({});
  const pendingCheckedMap = useRef<Record<string, number[]>>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutMap.current;
    return () => {
      Object.values(currentTimeouts).forEach(clearTimeout);
    };
  }, []);

  const toggleActionItem = useCallback(async (
    stepId: string,
    itemIndex: number,
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void,
    onError?: (message: string) => void
  ) => {
    if (!user) return;

    // 1. Get current step progress state (local state is the source of truth)
    const currentProg = progressMap[stepId];
    const currentChecked = pendingCheckedMap.current[stepId] ?? currentProg?.checked_items ?? [];

    // 2. Compute new checked items and completion status
    const newChecked = currentChecked.includes(itemIndex)
      ? currentChecked.filter((i) => i !== itemIndex)
      : [...currentChecked, itemIndex];

    const step = stepsMap[stepId];
    if (!step) return;
    const totalItems = step.action_items.length;
    const allDone = totalItems > 0 && newChecked.length >= totalItems;

    // Update pending map
    pendingCheckedMap.current[stepId] = newChecked;

    // 3. Optimistic UI update — updates instantly!
    setProgressMap((prev) => ({
      ...prev,
      [stepId]: {
        ...(prev[stepId] || { id: '', step_id: stepId, completed: false, checked_items: [], score_impact: null }),
        checked_items: newChecked,
        completed: allDone,
      },
    }));

    // 4. Debounce database persist
    if (timeoutMap.current[stepId]) {
      clearTimeout(timeoutMap.current[stepId]);
    }

    timeoutMap.current[stepId] = setTimeout(async () => {
      // Clean up timeout ref
      delete timeoutMap.current[stepId];

      if (inFlight.current.has(stepId)) return; // Simple safety check
      inFlight.current.add(stepId);
      setBusy(stepId, true);

      // Take a snapshot of the status when this write starts (for rollback)
      const prevDB = currentProg ? { ...currentProg } : null;
      const prevCheckedDB = prevDB?.checked_items ?? [];
      const prevCompletedDB = prevDB?.completed ?? false;

      try {
        let progressRow = prevDB;

        // If the row doesn't exist, we must insert it first
        if (!progressRow) {
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
          progressRow = {
            id: data.id,
            step_id: data.step_id,
            completed: data.completed,
            checked_items: data.checked_items || [],
            score_impact: data.score_impact,
          };
        }

        // Persist the final debounced checked items
        const finalChecked = pendingCheckedMap.current[stepId] ?? newChecked;
        const finalAllDone = totalItems > 0 && finalChecked.length >= totalItems;
        const finalJustCompleted = finalAllDone && !prevCompletedDB;

        const { error: updateErr } = await supabase
          .from('user_step_progress')
          .update({
            checked_items: finalChecked,
            completed: finalAllDone,
            completed_at: finalAllDone ? new Date().toISOString() : null,
            score_impact: finalAllDone ? step.score_impact : null,
          })
          .eq('id', progressRow.id);

        if (updateErr) throw updateErr;

        // Update local database status (stored in progressMap id ref)
        setProgressMap((prev) => ({
          ...prev,
          [stepId]: {
            ...prev[stepId],
            id: progressRow!.id,
          },
        }));

        // If completed, trigger backend score calculation & gamification
        if (finalJustCompleted) {
          await handleStepComplete(stepId, step.score_impact, onStepCompleteAnimation);
        }
      } catch (err: any) {
        console.error('[toggleActionItem] Failed to persist progress:', err);

        // Roll back local/optimistic state on failure
        setProgressMap((prev) => ({
          ...prev,
          [stepId]: {
            ...(prev[stepId] || { id: '', step_id: stepId, completed: false, checked_items: [], score_impact: null }),
            checked_items: prevCheckedDB,
            completed: prevCompletedDB,
          },
        }));
        pendingCheckedMap.current[stepId] = prevCheckedDB;

        // Try to revert database row if it exists
        const rowId = progressMap[stepId]?.id ?? prevDB?.id;
        if (rowId) {
          try {
            await supabase
              .from('user_step_progress')
              .update({
                checked_items: prevCheckedDB,
                completed: prevCompletedDB,
                completed_at: prevCompletedDB ? new Date().toISOString() : null,
                score_impact: prevCompletedDB ? step.score_impact : null,
              })
              .eq('id', rowId);
          } catch (revertErr) {
            console.error('[toggleActionItem] Rollback failed:', revertErr);
          }
        }

        await fetchProgress();
        onError?.('Could not save your progress — please try again');
      } finally {
        inFlight.current.delete(stepId);
        setBusy(stepId, false);
      }
    }, 400);
  }, [user, progressMap, stepsMap, handleStepComplete, fetchProgress]);

  const completePlan = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('complete_user_plan', { p_plan_id: planId });
      if (error) throw error;
    } catch (err) {
      console.error('Error completing plan:', err);
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
