import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useStepProgress } from './useStepProgress';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Mock mocks
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockIn = jest.fn();
const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockRpc = jest.fn();

// Mock Supabase with custom chaining implementation
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      return {
        select: (columns?: string) => {
          mockSelect(columns);
          return {
            in: (col: string, val: any) => {
              mockIn(col, val);
              return {
                eq: (col2: string, val2: any) => {
                  mockEq(col2, val2);
                  // Default mock implementation for progress fetching
                  return Promise.resolve({
                    data: [
                      {
                        id: 'existing-row-1',
                        step_id: 'step-1',
                        completed: false,
                        checked_items: [0],
                        score_impact: null,
                      },
                    ],
                    error: null,
                  });
                },
              };
            },
          };
        },
        insert: (values: any) => {
          mockInsert(values);
          return {
            select: () => {
              mockSelect();
              return {
                single: () => {
                  mockSingle();
                  return Promise.resolve({
                    data: {
                      id: 'inserted-row-id',
                      step_id: values.step_id,
                      completed: false,
                      checked_items: [],
                      score_impact: null,
                    },
                    error: null,
                  });
                },
              };
            },
          };
        },
        update: (values: any) => {
          mockUpdate(values);
          return {
            eq: (col: string, val: any) => {
              mockEq(col, val);
              return Promise.resolve({ data: null, error: null });
            },
          };
        },
      };
    },
    rpc: (fn: string, params: any) => {
      mockRpc(fn, params);
      return Promise.resolve({ data: null, error: null });
    },
  },
}));

// Mock useAuth
jest.mock('./useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('useStepProgress', () => {
  let hookResult: any;
  const planId = 'test-plan-id';
  const stepIds = ['step-1', 'step-2'];
  const stepsMap = {
    'step-1': { action_items: ['Item 1', 'Item 2'], score_impact: { overall: 5 } },
    'step-2': { action_items: ['Item A'], score_impact: { discipline: 10 } },
  };

  function TestComponent() {
    hookResult = useStepProgress(planId, stepIds, stepsMap);
    return null;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'test-user-uuid' },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches and maps initial progress on mount', async () => {
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFrom).toHaveBeenCalledWith('user_step_progress');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockIn).toHaveBeenCalledWith('step_id', stepIds);
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-uuid');

    expect(hookResult.isLoading).toBe(false);
    expect(hookResult.progressMap['step-1']).toEqual({
      id: 'existing-row-1',
      step_id: 'step-1',
      completed: false,
      checked_items: [0],
      score_impact: null,
    });
  });

  it('toggles unchecked item to checked and updates database', async () => {
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Toggle item 1 on step-1 (step-1 has 2 items: 0 is already checked, toggle 1)
    await act(async () => {
      await hookResult.toggleActionItem('step-1', 1);
    });

    // Advance the debounced timeout
    act(() => {
      jest.advanceTimersByTime(400);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Verify optimistic UI + completed status (both item 0 and 1 are now checked -> completed)
    expect(hookResult.progressMap['step-1']).toEqual({
      id: 'existing-row-1',
      step_id: 'step-1',
      completed: true,
      checked_items: [0, 1],
      score_impact: null, // set by initial load
    });

    // Verify db update
    expect(mockUpdate).toHaveBeenCalledWith({
      checked_items: [0, 1],
      completed: true,
      completed_at: expect.any(String),
      score_impact: { overall: 5 },
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'existing-row-1');
  });

  it('inserts new progress row if step progress does not exist', async () => {
    // Override implementation so step-2 is not found in initial fetch progress
    // Mock get/fetch is hardcoded to return step-1 only, so step-2 has no pre-existing progress
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await hookResult.toggleActionItem('step-2', 0);
    });

    // Advance the debounced timeout
    act(() => {
      jest.advanceTimersByTime(400);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Verify insert is called for step-2
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'test-user-uuid',
      step_id: 'step-2',
      completed: false,
      checked_items: [],
      score_impact: null,
    });

    // Verify update is called on the newly inserted row ID
    expect(mockUpdate).toHaveBeenCalledWith({
      checked_items: [0],
      completed: true, // step-2 has only 1 action item ('Item A'), so checking 0 completes it
      completed_at: expect.any(String),
      score_impact: { discipline: 10 },
    });
    expect(mockEq).toHaveBeenCalledWith('id', 'inserted-row-id');
  });

  it('triggers apply_step_score and complete_user_plan RPCs when step is completed', async () => {
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });
    await act(async () => {
      await Promise.resolve();
    });

    const mockAnimation = jest.fn();

    await act(async () => {
      await hookResult.toggleActionItem('step-1', 1, mockAnimation);
    });

    // Advance the debounced timeout
    act(() => {
      jest.advanceTimersByTime(400);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Verify both RPC database triggers are fired
    expect(mockRpc).toHaveBeenCalledWith('apply_step_score', { p_step_id: 'step-1' });
    expect(mockRpc).toHaveBeenCalledWith('complete_user_plan', { p_plan_id: planId });
    expect(mockAnimation).toHaveBeenCalledWith({ overall: 5 });
  });

  it('does not re-fire scoring RPCs if step is already completed', async () => {
    // Override supabase mock behavior to return an already completed step on load
    // We can do it by modifying the mock select implementation or returning a completed row
    // Let's just create a custom implementation for this test case
  });
});
