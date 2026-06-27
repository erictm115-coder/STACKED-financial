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
import { colors, spacing, typography } from '@/constants/theme';

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

  // Subtle opacity pulse on the tap hint.
  const pulse = useSharedValue(0.45);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
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
  blobArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  textArea: { flex: 1, justifyContent: 'flex-start' },
  headline: { ...typography.heading, color: colors.textPrimary },
  body: { marginTop: 20, gap: 16 },
  paragraph: { ...typography.bodyLg, color: colors.textSecondary },
  hint: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  hintText: { ...typography.caption, color: colors.textMuted },
});
