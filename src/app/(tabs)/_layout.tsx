import { Redirect, Tabs } from 'expo-router';
import { Search, User } from 'lucide-react-native';

import { StackedCoinsIcon } from '@/components/icons/StackedCoinsIcon';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useSubscription } from '@/hooks/useSubscription';

export default function TabsLayout() {
  const { isComplete, isLoading } = useOnboarding();
  const { status: subStatus, isActive } = useSubscription();

  // Guard the protected area. Also catches mid-session entitlement expiry — the
  // useSubscription listener flips isActive to false and bounces the user out.
  if (isLoading || subStatus === 'loading') {
    return <LoadingScreen />;
  }

  if (!isComplete) {
    return <Redirect href="/onboarding" />;
  }

  if (!isActive) {
    return <Redirect href="/subscription-lapsed" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandGreen,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.graphite,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'My Plans',
          tabBarIcon: ({ color, size }) => <StackedCoinsIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
