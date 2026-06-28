import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
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
const MESSAGE_INTERVAL = 500;

const MESSAGES = [
  "Here we go! Let's go!",
  "Analysing your answers...",
  "Understanding your goals...",
  "Calculating your Stacked Score...",
  "Building your personalised plan...",
  "Almost ready...",
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

    let index = 0;
    const advanceMessage = () => {
      if (index >= MESSAGES.length - 1) return;
      messageOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
        if (!finished) return;
        index += 1;
        runOnJS(setMessageIndex)(index);
        messageOpacity.value = withTiming(1, { duration: 200 });
      });
    };
    const messageTimer = setInterval(advanceMessage, MESSAGE_INTERVAL);

    const navTimer = setTimeout(() => {
      router.push('/onboarding/signup');
    }, FILL_DURATION);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const titleStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const messageStyle = useAnimatedStyle(() => ({ opacity: messageOpacity.value }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.upperContent}>
        <Animated.Text style={[styles.title, titleStyle]}>HERE WE GO!!!</Animated.Text>

        <Animated.Text style={[styles.subtitle, messageStyle]}>
          {MESSAGES[messageIndex]}
        </Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, fillStyle]} />
        </View>
      </View>

      <View style={styles.socialProof}>
        <StarRow size={14} />
        <Text style={styles.socialProofText}>40,000+ people already on their path</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  upperContent: { height: '60%', justifyContent: 'center', alignItems: 'center', width: '100%' },
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
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  socialProofText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#555555',
    textAlign: 'center',
  },
});
