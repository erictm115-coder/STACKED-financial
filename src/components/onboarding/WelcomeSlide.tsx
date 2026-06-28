import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, spacing, typography } from '@/constants/theme';

type Props = { index: number; activeIndex: number };

export function WelcomeSlide({ index, activeIndex }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const active = index === activeIndex;

  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = active
      ? withDelay(80, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }))
      : 0;
  }, [active, enter]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 20 }],
  }));

  return (
    <View style={[styles.page, { width }]}>
      <Animated.View style={[styles.content, contentStyle]}>
        <Image
          source={require('@/assets/images/welcome-illustration.png')}
          style={styles.art}
          contentFit="contain"
        />
        <Text style={styles.headline}>Welcome to Stacked</Text>
        <Text style={styles.sub}>Starting today, let&apos;s build wealth — on your terms.</Text>
      </Animated.View>

      <View style={styles.cta}>
        <PrimaryButton
          label="GET STARTED →"
          onPress={() => router.push('/onboarding/questionnaire')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  content: { alignItems: 'center', gap: 20 },
  art: { width: 220, aspectRatio: 960 / 1080, marginBottom: 8 },
  headline: { ...typography.heading, color: colors.textPrimary, textAlign: 'center' },
  sub: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  cta: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 48 },
});
