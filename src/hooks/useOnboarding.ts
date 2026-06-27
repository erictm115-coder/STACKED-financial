import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'stacked:onboardingComplete';

type UseOnboarding = {
  isComplete: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  /** Dev helper: clears the flag and returns to the onboarding flow. */
  resetOnboarding: () => Promise<void>;
};

export function useOnboarding(): UseOnboarding {
  const router = useRouter();
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (mounted) {
          setIsComplete(value === 'true');
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setIsComplete(true);
    router.replace('/home');
  }, [router]);

  const resetOnboarding = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setIsComplete(false);
    router.replace('/onboarding');
  }, [router]);

  return { isComplete, isLoading, completeOnboarding, resetOnboarding };
}
