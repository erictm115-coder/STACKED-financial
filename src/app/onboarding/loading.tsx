import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

const FILL_DURATION = 4500;
const MESSAGE_INTERVAL = 750;

const MESSAGES = [
  'Analysing your choices...',
  'Considering your options...',
  'Deep-diving your plans...',
  'Calculating your Stacked Score...',
  'Building your personalised plan...',
  'Almost ready...',
];

export default function Loading() {
  const router = useRouter();
  const progress = useSharedValue(0);
  const pulse = useSharedValue(1);
  const messageOpacity = useSharedValue(1);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: FILL_DURATION, easing: Easing.inOut(Easing.ease) });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );

    const navTimer = setTimeout(() => {
      router.push('/onboarding/signup');
    }, FILL_DURATION);

    return () => clearTimeout(navTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step the message index immediately on the interval tick.
  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => (i < MESSAGES.length - 1 ? i + 1 : i));
    }, MESSAGE_INTERVAL);
    return () => clearInterval(messageTimer);
  }, []);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Animated.Text style={[styles.title, titleStyle]}>Here we go!</Animated.Text>

        <Text style={styles.subtitle}>
          {MESSAGES[messageIndex]}
        </Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>

        <View style={styles.socialProof}>
          <StarRow size={14} />
          <Text style={styles.socialProofText}>40,000+ people already on their path</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  title: { fontFamily: fonts.black, fontSize: 36, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.ash, textAlign: 'center', marginTop: 12 },
  barTrack: {
    width: '100%',
    height: 8,
    borderRadius: 100,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    marginTop: 24,
  },
  barFill: { height: '100%', borderRadius: 100, backgroundColor: colors.brandGreen },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: 24,
  },
  socialProofText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
  },
});
