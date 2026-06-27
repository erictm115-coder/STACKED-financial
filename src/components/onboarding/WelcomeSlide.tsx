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
import Svg, { Circle, Path } from 'react-native-svg';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, spacing, typography } from '@/constants/theme';

type Props = { index: number; activeIndex: number };

/**
 * Flat line-art placeholder: green ring + upward arrow (growth).
 * TODO: replace with final illustration art.
 */
function GrowthMark({ size = 132 }: { size?: number }) {
  const stroke = 6;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Circle cx="50" cy="50" r="42" stroke={colors.brandGreen} strokeWidth={stroke} />
      <Path
        d="M30 62 L46 46 L57 57 L72 40"
        stroke={colors.accentBlue}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M62 40 L72 40 L72 50"
        stroke={colors.accentBlue}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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
        <View style={styles.art}>
          <GrowthMark />
        </View>
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
  art: { marginBottom: 8 },
  headline: { ...typography.heading, color: colors.textPrimary, textAlign: 'center' },
  sub: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center' },
  cta: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 48 },
});
