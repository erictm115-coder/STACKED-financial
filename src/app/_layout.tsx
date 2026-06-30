import { useFonts } from 'expo-font';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { configurePurchases, identifyUser, logoutUser } from '@/lib/purchases';
import { Image as ExpoImage } from 'expo-image';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user } = useAuth();
  const prevUserRef = useRef<string | null>(null);

  const [fontsLoaded] = useFonts({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // 1. Configure Purchases & preload heavy image assets on mount
  useEffect(() => {
    configurePurchases().catch(() => {});
    
    ExpoImage.prefetch([
      require('../../assets/images/appicon.png'),
      require('../../assets/images/apps.png'),
      require('../../assets/images/hero.png'),
      require('../../assets/images/love.png'),
      require('../../assets/images/map.png'),
    ]).catch(() => {});
  }, []);

  // 2. Identify / Logout user on session state changes
  useEffect(() => {
    if (user) {
      identifyUser(user.id).catch(() => {});
      prevUserRef.current = user.id;
    } else if (prevUserRef.current) {
      logoutUser().catch(() => {});
      prevUserRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
