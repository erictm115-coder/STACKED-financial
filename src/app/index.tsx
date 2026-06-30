import { Redirect } from 'expo-router';
import { View } from 'react-native';

import LoadingScreen from '@/components/LoadingScreen';
import { colors } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Entry gate. Routing order:
 *   1. Onboarding flag loading        → blank splash
 *   2. Onboarding NOT complete        → onboarding flow (subscription is NOT
 *      checked here — the user hasn't reached the paywall yet)
 *   3. Onboarding complete, sub loading → LoadingScreen
 *   4. Onboarding complete, no sub     → subscription-lapsed
 *   5. Onboarding complete, active sub → main app
 */
export default function Index() {
  const { isComplete, isLoading } = useOnboarding();
  const { status: subStatus, isActive } = useSubscription();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  if (!isComplete) {
    return <Redirect href="/onboarding" />;
  }

  // Onboarding is complete — RevenueCat is now the gate.
  if (subStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (!isActive) {
    return <Redirect href="/subscription-lapsed" />;
  }

  return <Redirect href="/discover" />;
}
