import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

const DOT = 8;
const ACTIVE_WIDTH = 24;

function Dot({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 250 });
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    width: DOT + (ACTIVE_WIDTH - DOT) * progress.value,
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.graphite, colors.brandGreen]),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

type Props = { count: number; activeIndex: number };

export function ProgressDots({ count, activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: DOT, borderRadius: DOT / 2 },
});
