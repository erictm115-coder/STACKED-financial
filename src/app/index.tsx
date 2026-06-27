import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { colors } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

/**
 * Entry gate. Reads onboarding completion from AsyncStorage and routes to the
 * onboarding flow or the placeholder app accordingly.
 */
export default function Index() {
  const { isComplete, isLoading } = useOnboarding();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return <Redirect href={isComplete ? '/home' : '/onboarding'} />;
}
