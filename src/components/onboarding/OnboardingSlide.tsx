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
import { Image } from 'expo-image';

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
      <View style={styles.centeredGroup}>
        <View style={styles.mediaContainer}>
          {slide.key === 's2' ? (
            <Image
              source={require('../../../assets/images/appicon.png')}
              style={styles.appIconImage}
              contentFit="contain"
              transition={0}
            />
          ) : slide.key === 's5' ? (
            <Image
              source={require('../../../assets/images/love.png')}
              style={styles.loveImage}
              contentFit="contain"
              transition={0}
            />
          ) : slide.key === 's4' ? (
            // Empty placeholder to keep the headline/text height perfectly aligned
            null
          ) : (
            <PulsingBlob size={110} color={colors.brandGreen} />
          )}
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
            {slide.key === 's4' && (
              <Image
                source={require('../../../assets/images/map.png')}
                style={styles.mapImage}
                contentFit="contain"
                transition={0}
              />
            )}
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[styles.hint, hintStyle]} pointerEvents="none">
        <Animated.Text style={[styles.hintText, pulseStyle]}>Tap to continue</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: spacing.xl },
  // Blob + text are one centered group, so the blob sits directly above the
  // text instead of being pinned to the top edge of the screen.
  centeredGroup: { flex: 1, justifyContent: 'center' },
  mediaContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    transform: [{ translateY: -10 }],
  },
  appIconImage: {
    width: 110,
    height: 110,
    alignSelf: 'center',
  },
  loveImage: {
    width: 110,
    height: 110,
    alignSelf: 'center',
  },
  mapImage: {
    width: '100%',
    height: 265,
    marginTop: 20,
    alignSelf: 'center',
  },
  textArea: { paddingBottom: 24 },
  headline: { fontFamily: fonts.extraBold, fontSize: 23, lineHeight: 29, color: colors.textPrimary },
  body: { marginTop: 16, gap: 12 },
  paragraph: {
    fontFamily: fonts.extraBold,
    fontSize: 23,
    lineHeight: 29,
    color: colors.textSecondary,
  },
  hint: { position: 'absolute', bottom: 84, left: 0, right: 0, alignItems: 'center' },
  hintText: { fontFamily: fonts.bold, fontSize: 16, color: '#999999' },
});
