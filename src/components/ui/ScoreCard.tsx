import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Easing as RNEasing, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius } from '@/constants/theme';

type Props = {
  icon: ReactNode;
  label: string;
  score: number;
  delta?: number | null;
  /** true = green "potential" styling, false = red "current" styling. */
  isHigh: boolean;
  /** Stagger offset so cards count up in sequence rather than all at once. */
  delayMs?: number;
};

const COUNT_UP_DURATION = 1000;
const CARD_HEIGHT = 110;

/** Counts from `from` to `to` over the given duration using an ease-out curve, after an optional delay. */
function useCountUp(to: number, from: number, duration: number, delayMs: number) {
  const [value, setValue] = useState(from);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    setValue(from);

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

    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      clearTimeout(timer);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [to, from, duration, delayMs]);

  return value;
}

export function ScoreCard({ icon, label, score, delta = null, isHigh, delayMs = 0 }: Props) {
  const startValue = delta != null ? score - delta : 0;
  const displayScore = useCountUp(score, startValue, COUNT_UP_DURATION, delayMs);

  const barColor = isHigh ? colors.brandGreen : '#ff4b4b';
  const pct = Math.min(Math.max(displayScore, 0), 100);

  const barStyle = useAnimatedStyle(() => ({
    width: withTiming(`${pct}%`, {
      duration: COUNT_UP_DURATION,
      easing: Easing.out(Easing.cubic),
    }),
  }));

  return (
    <View style={styles.card}>
      {delta != null && (
        <View style={styles.deltaBadge}>
          <Text style={styles.deltaText}>+{delta}</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        {icon}
        <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {label}
        </Text>
      </View>

      <Text style={styles.score}>{displayScore}</Text>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle, { backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: 12,
    justifyContent: 'space-between',
  },
  deltaBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0a2200',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  deltaText: { fontFamily: fonts.bold, fontSize: 11, color: colors.brandGreen },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 36 },
  label: { fontFamily: fonts.bold, fontSize: 11, color: colors.ash, flexShrink: 1 },
  score: { fontFamily: fonts.black, fontSize: 36, color: colors.textPrimary },
  barTrack: {
    height: 5,
    width: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: radius.pill },
});
