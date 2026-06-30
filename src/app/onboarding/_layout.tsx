import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Hard paywall: no swipe-back, no header back. The only way off this
          screen is a successful purchase or restore. */}
      <Stack.Screen
        name="paywall"
        options={{
          gestureEnabled: false,
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
