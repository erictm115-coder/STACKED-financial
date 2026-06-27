import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarRow } from '@/components/icons/StarIcon';
import { colors, fonts, spacing } from '@/constants/theme';

const FILL_DURATION = 3000;

export default function Loading() {
  const router = useRouter();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, { duration: FILL_DURATION, easing: Easing.inOut(Easing.ease) });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    const timer = setTimeout(() => {
      router.push('/onboarding/signup');
    }, FILL_DURATION);

    return () => clearTimeout(timer);
  }, [progress, pulse, router]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>HERE WE GO!!!</Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>

        <Text style={styles.subtitle}>Building your financial plan…</Text>
      </View>

      <View style={styles.socialProof}>
        <StarRow size={13} />
        <Text style={styles.socialProofText}>40,000+ people already on their path</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.black, fontSize: 36, color: colors.textPrimary, textAlign: 'center' },
  barTrack: {
    width: '100%',
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 100, backgroundColor: colors.brandGreen },
  subtitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.ash, textAlign: 'center' },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  socialProofText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
