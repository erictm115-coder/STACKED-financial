import { useEffect, useRef, useState } from 'react';
import { Easing as RNEasing, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  icon: string;
  label: string;
  score: number;
  delta?: number | null;
  /** true = green "potential" styling, false = red "current" styling. */
  isHigh: boolean;
  /** Card spans the full row instead of half (used for the Overall card). */
  fullWidth?: boolean;
};

const COUNT_UP_DURATION = 800;

/** Counts from `from` to `to` over the given duration using an ease-out curve. */
function useCountUp(to: number, from: number, duration: number) {
  const [value, setValue] = useState(from);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = RNEasing.out(RNEasing.cubic)(progress);
      setValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [to, from, duration]);

  return value;
}

export function ScoreCard({ icon, label, score, delta = null, isHigh, fullWidth = false }: Props) {
  const startValue = delta != null ? score - delta : 0;
  const displayScore = useCountUp(score, startValue, COUNT_UP_DURATION);

  const barColor = isHigh ? colors.brandGreen : '#ff4b4b';
  const pct = Math.min(Math.max(displayScore, 0), 100);

  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct}%`, { duration: COUNT_UP_DURATION, easing: Easing.out(Easing.cubic) }),
  }));

  return (
    <View style={[styles.card, fullWidth && styles.fullWidth]}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{displayScore}</Text>
        {delta != null && (
          <View style={styles.deltaBadge}>
            <Text style={styles.deltaText}>+{delta}</Text>
          </View>
        )}
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle, { backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: 16,
    gap: 8,
  },
  fullWidth: {
    flexBasis: '100%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  icon: { fontSize: 16 },
  label: { fontFamily: fonts.bold, fontSize: 13, color: colors.ash },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  score: { fontFamily: fonts.black, fontSize: 40, color: colors.textPrimary },
  deltaBadge: {
    backgroundColor: '#0a2200',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deltaText: { fontFamily: fonts.bold, fontSize: 12, color: colors.brandGreen },
  barTrack: {
    height: 6,
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: radius.pill },
});
