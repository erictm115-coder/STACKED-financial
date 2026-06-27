import type { Scores } from '@/lib/calculateScores';
import { supabase } from '@/lib/supabase';
import type { OnboardingAnswers } from '@/store/onboardingStore';

type Result<T> = { data: T | null; error: string | null };

export function useOnboardingData() {
  const saveAnswers = async (
    userId: string,
    answers: OnboardingAnswers,
  ): Promise<Result<null>> => {
    const { error } = await supabase.from('onboarding_answers').insert({
      user_id: userId,
      finance_frequency: answers.financeFrequency,
      life_goal: answers.lifeGoal,
      age_group: answers.ageGroup,
      last_control: answers.lastControl,
      resonating_word: answers.resonatingWord,
      money_habits: answers.moneyHabits,
      download_reason: answers.downloadReason,
    });
    return { data: null, error: error?.message ?? null };
  };

  const saveScores = async (userId: string, scores: Scores): Promise<Result<null>> => {
    const { error } = await supabase.from('stacked_scores').insert({
      user_id: userId,
      overall: scores.overall,
      money_mindset: scores.moneyMindset,
      clarity: scores.clarity,
      discipline: scores.discipline,
      focus: scores.focus,
      investment_readiness: scores.investmentReadiness,
    });
    return { data: null, error: error?.message ?? null };
  };

  const getScores = async (userId: string): Promise<Result<Scores>> => {
    const { data, error } = await supabase
      .from('stacked_scores')
      .select('overall, money_mindset, clarity, discipline, focus, investment_readiness')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { data: null, error: error?.message ?? null };
    }

    return {
      data: {
        overall: data.overall,
        moneyMindset: data.money_mindset,
        clarity: data.clarity,
        discipline: data.discipline,
        focus: data.focus,
        investmentReadiness: data.investment_readiness,
      },
      error: null,
    };
  };

  return { saveAnswers, saveScores, getScores };
}
