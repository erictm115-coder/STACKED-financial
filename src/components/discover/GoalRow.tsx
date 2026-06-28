import * as Haptics from 'expo-haptics';
import { Bookmark, ChevronRight, Lock } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { goalMetaLabel, type Goal } from '@/data/goals';

type Props = {
  goal: Goal;
  saved: boolean;
  onToggleSaved: () => void;
  /** Open this goal's plan (free goals). */
  onOpen: () => void;
  /** Locked goal tapped — surface the paywall. */
  onLocked: () => void;
};

/**
 * A single goal in the Discover list. Swipe right to reveal "Create plan" (the
 * primary action), or tap the row. Locked (premium) goals route to the paywall.
 */
export function GoalRow({ goal, saved, onToggleSaved, onOpen, onLocked }: Props) {
  const swipeRef = useRef<Swipeable>(null);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (goal.isPremium) onLocked();
    else onOpen();
  };

  const renderLeftActions = () => (
    <View style={styles.swipeAction}>
      <Text style={styles.swipeText}>Create plan</Text>
      <ChevronRight size={18} color={colors.textPrimary} />
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      enabled={!goal.isPremium}
      renderLeftActions={renderLeftActions}
      leftThreshold={48}
      friction={2}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          swipeRef.current?.close();
          onOpen();
        }
      }}
    >
      <Pressable style={styles.row} onPress={handlePress}>
        <View style={styles.iconWrap}>
          <GoalIcon
            iconKey={goal.iconKey}
            color={goal.isPremium ? colors.ash : colors.brandGreen}
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {goal.title}
          </Text>
          <Text style={styles.meta}>{goalMetaLabel(goal)}</Text>
        </View>

        {goal.isPremium ? (
          <View style={styles.trailingBtn}>
            <Lock size={18} color={colors.ash} />
          </View>
        ) : (
          <Pressable
            style={styles.trailingBtn}
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync();
              onToggleSaved();
            }}
          >
            <Bookmark
              size={20}
              color={saved ? colors.brandGreen : colors.ash}
              fill={saved ? colors.brandGreen : 'transparent'}
            />
          </Pressable>
        )}
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  textBlock: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  meta: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.ash },
  trailingBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  swipeAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.brandGreen,
    borderRadius: radius.card,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  swipeText: { fontFamily: fonts.extraBold, fontSize: 14, color: colors.textPrimary },
});
