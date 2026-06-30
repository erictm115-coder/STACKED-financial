import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Bookmark, Lock, Plus, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { GoalIcon } from '@/components/main/GoalIcon';
import { type Goal } from '@/data/goals';

export type GoalStatus = 'not_started' | 'active' | 'completed';

interface Props {
  goal: Goal;
  saved: boolean;
  status: GoalStatus;
  progressPercent?: number;
  hasPro?: boolean;
  onToggleSaved: (goalId: string) => void;
  onOpen: (goalId: string) => void;
  onLocked: () => void;
  onRequestStartPlan: (goalId: string) => void; // bottom sheet confirmation trigger
}

export function GoalRow({
  goal,
  saved,
  status,
  progressPercent,
  hasPro = false,
  onToggleSaved,
  onOpen,
  onLocked,
  onRequestStartPlan,
}: Props) {
  const swipeRef = useRef<Swipeable>(null);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (goal.isPremium && !hasPro) {
      onLocked();
    } else {
      onOpen(goal.id);
    }
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return { bg: '#0a2200', text: colors.brandGreen, border: colors.brandGreen };
      case 'intermediate':
        return { bg: '#0a1a3a', text: colors.accentBlue, border: colors.accentBlue };
      default:
        return { bg: '#2a0a0a', text: '#ff4b4b', border: '#ff4b4b' };
    }
  };

  const diffStyles = getDifficultyStyles(goal.difficulty);

  const renderLeftActions = () => (
    <View style={styles.swipeLeftAction}>
      <Plus size={20} color="#ffffff" />
      <Text style={styles.swipeLeftText}>
        {status === 'active' ? 'Continue →' : 'Start Plan'}
      </Text>
    </View>
  );

  const renderRightActions = () => (
    <View style={styles.swipeRightAction}>
      <Bookmark size={20} color={colors.brandGreen} fill={saved ? colors.brandGreen : 'transparent'} />
      <Text style={styles.swipeRightText}>{saved ? 'Saved' : 'Save'}</Text>
    </View>
  );

  const getContainerStyle = () => {
    switch (status) {
      case 'completed':
        return [styles.row, { backgroundColor: '#0a2200', borderColor: '#58cc02' }];
      case 'active':
        return [styles.row, { borderColor: '#1cb0f6' }];
      default:
        return [styles.row, { borderColor: '#3c3c3c' }];
    }
  };

  const getTitleStyle = () => {
    if (status === 'completed') {
      return [styles.title, { color: '#cccccc' }];
    }
    return styles.title;
  };

  return (
    <Swipeable
      ref={swipeRef}
      enabled={(!goal.isPremium || hasPro) && status !== 'completed'}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={50}
      rightThreshold={50}
      friction={1.5}
      onSwipeableOpen={(direction) => {
        swipeRef.current?.close();
        if (direction === 'left') {
          // Swiped right -> Reveals Left Action (Create/Continue Plan)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (status === 'active') {
            onOpen(goal.id);
          } else {
            onRequestStartPlan(goal.id);
          }
        } else if (direction === 'right') {
          // Swiped left -> Reveals Right Action (Save)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onToggleSaved(goal.id);
        }
      }}
    >
      <Pressable style={getContainerStyle()} onPress={handlePress}>
        {status === 'active' && progressPercent !== undefined && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{Math.round(progressPercent)}%</Text>
          </View>
        )}

        <View style={styles.iconWrap}>
          <GoalIcon
            iconKey={goal.iconKey}
            color={goal.isPremium ? colors.ash : diffStyles.text}
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={getTitleStyle()} numberOfLines={1}>
            {goal.title}
          </Text>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.diffPill,
                { backgroundColor: diffStyles.bg, borderColor: diffStyles.border },
              ]}
            >
              <Text style={[styles.diffText, { color: diffStyles.text }]}>
                {goal.difficulty}
              </Text>
            </View>
            {goal.estDuration && <Text style={styles.duration}>{goal.estDuration}</Text>}
          </View>
        </View>

        <View style={styles.trailing}>
          {status === 'completed' ? (
            <CheckCircle2 size={20} color="#58cc02" fill="rgba(88, 204, 2, 0.1)" />
          ) : (goal.isPremium && !hasPro) ? (
            <Lock size={16} color="#555555" />
          ) : (
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.selectionAsync();
                onToggleSaved(goal.id);
              }}
            >
              <Bookmark
                size={16}
                color={saved ? colors.brandGreen : '#555555'}
                fill={saved ? colors.brandGreen : 'transparent'}
              />
            </Pressable>
          )}
        </View>
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
    paddingVertical: 18,
    position: 'relative',
  },
  activeBadge: {
    position: 'absolute',
    top: 6,
    right: 12,
    backgroundColor: 'rgba(28, 176, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#1cb0f6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#1cb0f6',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  textBlock: { flex: 1, gap: 4 },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diffPill: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  diffText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  duration: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
  },
  trailing: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Swipe styles
  swipeLeftAction: {
    flex: 1,
    backgroundColor: colors.brandGreen,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginVertical: 1, // subtle visual separation
  },
  swipeLeftText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#ffffff',
  },
  swipeRightAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.brandGreenOutline,
    borderRadius: radius.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginVertical: 1,
  },
  swipeRightText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brandGreen,
  },
});
