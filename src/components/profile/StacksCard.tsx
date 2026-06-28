import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Layers } from 'lucide-react-native';

import { colors, fonts, radius, spacing } from '@/constants/theme';

// ─── League system ──────────────────────────────────────────────────────────
interface League {
  name: string;
  min: number;
  max: number; // Infinity for top tier
  color: string;
}

const LEAGUES: League[] = [
  { name: 'Beginner',     min: 0,   max: 9,   color: colors.ash },
  { name: 'Challenger',   min: 10,  max: 24,  color: colors.brandGreen },
  { name: 'Builder',      min: 25,  max: 49,  color: colors.accentBlue },
  { name: 'Wealth Maker', min: 50,  max: 99,  color: '#f4c430' },
  { name: 'Stacked Elite',min: 100, max: Infinity, color: '#ff4b4b' },
];

function getLeague(stacks: number) {
  return LEAGUES.find((l) => stacks >= l.min && stacks <= l.max) ?? LEAGUES[0];
}

function getNextLeague(stacks: number): League | null {
  const idx = LEAGUES.findIndex((l) => stacks >= l.min && stacks <= l.max);
  return idx >= 0 && idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
}

// ─── Stacked blocks visual ───────────────────────────────────────────────────
function StackBlocks({ count, color }: { count: number; color: string }) {
  // Show up to 5 stacked block icons, filled based on progress in current league
  const filled = Math.min(count, 5);
  return (
    <View style={blockStyles.row}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View
          key={i}
          style={[
            blockStyles.block,
            i < filled
              ? { backgroundColor: color, borderColor: color }
              : { backgroundColor: 'transparent', borderColor: colors.graphite },
          ]}
        />
      ))}
    </View>
  );
}

const blockStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'flex-end',
  },
  block: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
  },
});

// ─── Main component ──────────────────────────────────────────────────────────
interface Props {
  stackCount: number;
}

export function StacksCard({ stackCount }: Props) {
  const currentLeague = getLeague(stackCount);
  const nextLeague = getNextLeague(stackCount);

  // Progress 0→1 within this league tier
  const tierSize = currentLeague.max === Infinity
    ? 1
    : currentLeague.max - currentLeague.min + 1;
  const tierProgress = currentLeague.max === Infinity
    ? 1
    : (stackCount - currentLeague.min) / tierSize;

  const stacksUntilNext = nextLeague ? nextLeague.min - stackCount : 0;

  // Animated progress bar
  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(tierProgress, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
  }, [tierProgress]);

  const barStyle = useAnimatedStyle(() => ({
    flex: progressWidth.value,
  }));

  return (
    <View style={styles.card}>
      {/* Top row: icon + count */}
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { borderColor: currentLeague.color + '55' }]}>
          <Layers size={26} color={currentLeague.color} />
        </View>

        <View style={styles.mainText}>
          <Text style={[styles.count, { color: currentLeague.color }]}>
            {stackCount}
          </Text>
          <Text style={styles.label}>Stacks</Text>
        </View>

        {/* Block visualiser */}
        <StackBlocks count={(stackCount - currentLeague.min) % 5 + (stackCount === 0 ? 0 : 1)} color={currentLeague.color} />
      </View>

      {/* League badge */}
      <View style={styles.leagueBadge}>
        <View style={[styles.leagueDot, { backgroundColor: currentLeague.color }]} />
        <Text style={[styles.leagueName, { color: currentLeague.color }]}>
          {currentLeague.name} League
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { backgroundColor: currentLeague.color }, barStyle]} />
        <View style={styles.barRemainder} />
      </View>

      {/* Progress caption */}
      <Text style={styles.caption}>
        {nextLeague
          ? `${stacksUntilNext} stack${stacksUntilNext !== 1 ? 's' : ''} until ${nextLeague.name}`
          : 'You have reached the top league!'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
  },
  mainText: {
    flex: 1,
  },
  count: {
    fontFamily: fonts.black,
    fontSize: 36,
    lineHeight: 40,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ash,
    marginTop: -2,
  },
  leagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  leagueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  leagueName: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  barTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    marginTop: spacing.xs,
  },
  barFill: {
    borderRadius: 3,
  },
  barRemainder: {
    flex: 1,
  },
  caption: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
  },
});
