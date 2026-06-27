import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { colors } from '@/constants/theme';

type Props = { step: number; total: number };

/** Thin top progress bar used across the questionnaire steps (slides 7-13). */
export function StepProgressBar({ step, total }: Props) {
  const pct = Math.min(Math.max(step / total, 0), 1) * 100;

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct}%`, { duration: 400, easing: Easing.out(Easing.cubic) }),
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, width: '100%', backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.brandGreen },
});
