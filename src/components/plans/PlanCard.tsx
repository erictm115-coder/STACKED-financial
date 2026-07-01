import React, { useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { type UserPlan } from '@/hooks/usePlans';

interface Props {
  plan: UserPlan;
  onDelete: (planId: string) => void;
}

export const PlanCard = React.memo(function PlanCard({ plan, onDelete }: Props) {
  const router = useRouter();
  
  const completedSteps = plan.user_step_progress.filter((p) => p.completed).length;
  const totalSteps = 5;
  const progressPercent = (completedSteps / totalSteps) * 100;

  const widthVal = useSharedValue(0);
  
  useEffect(() => {
    widthVal.value = withTiming(progressPercent, { duration: 600 });
  }, [progressPercent]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${widthVal.value}%`,
    };
  });

  const handleDelete = (e: any) => {
    e.stopPropagation();
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan? This will reset all your progress for this goal.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(plan.id) }
      ]
    );
  };

  const getStreamLabel = (stream: string) => {
    switch (stream) {
      case 'money_foundations':
        return 'Foundations';
      case 'income_builders':
        return 'Income';
      case 'wealthy_habits':
        return 'Habits';
      default:
        return stream;
    }
  };

  const getRelativeTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/plans/${plan.id}` as any)}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <GoalIcon iconKey={plan.goals?.icon_key || 'credit-card'} color={colors.brandGreen} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {plan.goals?.title || 'Financial Plan'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.stream}>
              {getStreamLabel(plan.goals?.stream || '')}
            </Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.time}>{getRelativeTime(plan.created_at)}</Text>
          </View>
        </View>
        <View style={styles.rightRow}>
          <View style={styles.counterWrap}>
            <Text style={styles.counter}>
              {completedSteps}/{totalSteps}
            </Text>
          </View>
          <Pressable hitSlop={12} onPress={handleDelete} style={styles.trashBtn} accessibilityRole="button">
            <Trash2 size={16} color={colors.ash} />
          </Pressable>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, progressStyle]} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.input,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stream: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.ash,
    textTransform: 'uppercase',
  },
  bullet: {
    fontSize: 12,
    color: colors.ash,
  },
  time: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: '#555555',
  },
  counterWrap: {
    backgroundColor: '#0a2200',
    borderWidth: 1,
    borderColor: colors.brandGreenOutline,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counter: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.brandGreen,
  },
  track: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.brandGreen,
    borderRadius: 3,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trashBtn: {
    padding: 4,
  },
});
