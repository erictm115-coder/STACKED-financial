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

  const mapDimensionToColumn = (dim: string): string => {
    if (dim === 'moneyMindset') return 'money_mindset';
    if (dim === 'investmentReadiness') return 'investment_readiness';
    return dim;
  };

  // Valid Stack Score columns — score_impact keys that don't map to one of these
  // are logged and ignored rather than crashing the update (Bug 1, cause D).
  const VALID_SCORE_COLUMNS = new Set([
    'overall',
    'money_mindset',
    'clarity',
    'discipline',
    'focus',
    'investment_readiness',
  ]);

  /**
   * Applies a completed step's score impact and bumps gamification.
   * Throws on any failure so the caller can roll back the optimistic UI.
   */
  const handleStepComplete = async (
    stepId: string,
    scoreImpact: Record<string, number>,
    onStepCompleteAnimation?: (scoreImpact: Record<string, number>) => void
  ) => {
    if (!user) return;
    try {
      // 1. Load the user's current Stack Score.
      //    order+limit(1) tolerates duplicate rows (the historical root cause of
      //    "Failed to handle step completion") instead of throwing on >1 row.
      const { data: currentScore, error: scoreErr } = await supabase
        .from('stacked_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scoreErr) throw scoreErr;

      let scoresToUpdate = currentScore;
      if (!scoresToUpdate) {
        // No score row yet — create a default one before updating.
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

      // 2. Build the update, mapping camelCase dimensions to snake_case columns
      //    and ignoring (logging) any unknown keys.
      const updates: Record<string, number> = {};
      const validDeltas: number[] = [];
      Object.entries(scoreImpact || {}).forEach(([dimension, delta]) => {
        const dbColumn = mapDimensionToColumn(dimension);
        if (!VALID_SCORE_COLUMNS.has(dbColumn)) {
          console.warn(`[handleStepComplete] Ignoring unknown score dimension: ${dimension}`);
          return;
        }
        const current = scoresToUpdate[dbColumn] ?? 0;
        updates[dbColumn] = Math.min(99, current + delta);
        validDeltas.push(delta);
      });

      if (validDeltas.length > 0) {
        const maxDelta = Math.max(...validDeltas);
        updates['overall'] = Math.min(99, (scoresToUpdate.overall ?? 0) + maxDelta);

        // Scope the update to the specific row we read so duplicate rows don't
        // all get bumped.
        const { error: updateScoreErr } = await supabase
          .from('stacked_scores')
          .update(updates)
          .eq('id', scoresToUpdate.id);

        if (updateScoreErr) throw updateScoreErr;
      }

      // 3. Bump gamification (stacks + streak).
      const { error: rpcErr } = await supabase.rpc('increment_stacks', { uid: user.id });
      if (rpcErr) throw rpcErr;

      // 4. Celebration callback.
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
      const { error } = await supabase
        .from('user_plans')
        .update({ status: 'completed' })
        .eq('id', planId);

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
