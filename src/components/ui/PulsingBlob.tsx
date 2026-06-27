import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

type Props = { size?: number };

/**
 * Soft glowing blue orb with a gentle ~3s scale pulse (1.0 -> 1.08 -> 1.0).
 * The glow is built from layered translucent circles — no gradients, no shadows.
 */
export function PulsingBlob({ size = 180 }: Props) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, animatedStyle]}>
      <View
        style={[styles.halo, { width: size, height: size, borderRadius: size / 2, opacity: 0.12 }]}
      />
      <View
        style={[
          styles.halo,
          { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36, opacity: 0.22 },
        ]}
      />
      <View
        style={[
          styles.halo,
          { width: size * 0.48, height: size * 0.48, borderRadius: size * 0.24, opacity: 1 },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', backgroundColor: colors.accentBlue },
});
