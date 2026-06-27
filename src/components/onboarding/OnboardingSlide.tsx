import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Slide } from '@/components/onboarding/slides';
import { HighlightedText } from '@/components/ui/HighlightedText';
import { PulsingBlob } from '@/components/ui/PulsingBlob';
import { colors, fonts, spacing } from '@/constants/theme';

type Props = {
  slide: Slide;
  index: number;
  activeIndex: number;
  onAdvance: () => void;
};

/** Fade + slide-up entrance, replayed each time the slide becomes active. */
function useEntrance(active: boolean, delay: number) {
  const v = useSharedValue(0);
  useEffect(() => {
    if (active) {
      v.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    } else {
      v.value = 0;
    }
  }, [active, delay, v]);

  return useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: (1 - v.value) * 20 }],
  }));
}

export function OnboardingSlide({ slide, index, activeIndex, onAdvance }: Props) {
  const { width } = useWindowDimensions();
  const active = index === activeIndex;

  // Staggered: headline, then body, then tap hint.
  const headlineStyle = useEntrance(active, 0);
  const bodyStyle = useEntrance(active, 120);
  const hintStyle = useEntrance(active, 240);

  // Subtle opacity pulse on the tap hint: 0.4 -> 0.9 -> 0.4 over a 2s loop.
  const pulse = useSharedValue(0.4);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Pressable onPress={onAdvance} style={[styles.page, { width }]}>
      <View style={styles.blobArea}>
        <PulsingBlob />
      </View>

      <View style={styles.textArea}>
        <Animated.View style={headlineStyle}>
          <HighlightedText
            segments={slide.headline}
            style={styles.headline}
            baseColor={colors.textPrimary}
          />
        </Animated.View>

        <Animated.View style={[styles.body, bodyStyle]}>
          {slide.body.map((paragraph, i) => (
            <Text key={i} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </Animated.View>
      </View>

      <Animated.View style={[styles.hint, hintStyle]} pointerEvents="none">
        <Animated.Text style={[styles.hintText, pulseStyle]}>Tap to continue</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: spacing.xl },
  // Smaller blob area + textArea given extra weight pulls the text block up to
  // roughly the 52%-from-top mark instead of sitting low against the bottom.
  blobArea: { flex: 0.85, alignItems: 'center', justifyContent: 'center' },
  textArea: { flex: 1.15, justifyContent: 'flex-start', paddingBottom: 80 },
  headline: { fontFamily: fonts.extraBold, fontSize: 26, lineHeight: 32, color: colors.textPrimary },
  body: { marginTop: 16, gap: 12 },
  paragraph: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  hint: { position: 'absolute', bottom: 52, left: 0, right: 0, alignItems: 'center' },
  hintText: { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted },
});
