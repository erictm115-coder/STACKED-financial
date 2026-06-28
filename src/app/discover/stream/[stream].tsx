import React, { useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { GoalRow } from '@/components/discover/GoalRow';
import { DifficultyDivider } from '@/components/discover/DifficultyDivider';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { usePlans } from '@/hooks/usePlans';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StreamDetail() {
  const router = useRouter();
  const { stream } = useLocalSearchParams<{ stream: string }>();
  
  const goals = useAppStore((s) => s.goals);
  const {
    createPlan,
    savePlan,
    unsavePlan,
    isSaved,
    isActive,
    userPlans,
  } = usePlans();

  const [confirmGoalId, setConfirmGoalId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  // Reanimated values for Bottom Sheet
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);
  const sheetBackdropOpacity = useSharedValue(0);

  // Reanimated values for Toast
  const toastTranslateY = useSharedValue(-100);
  const toastOpacity = useSharedValue(0);

  const streamMeta = useMemo(() => {
    switch (stream) {
      case 'money_foundations':
        return {
          icon: '💰',
          title: 'Money Foundations',
          subtitle: 'Build the core financial skills everyone needs',
        };
      case 'income_builders':
        return {
          icon: '🚀',
          title: 'Income Builders',
          subtitle: 'Hobbies and skills that put real money in your pocket',
        };
      case 'wealthy_habits':
        return {
          icon: '🎯',
          title: 'Wealthy Habits',
          subtitle: 'The daily practices of people who build lasting wealth',
        };
      default:
        return {
          icon: '✨',
          title: 'Explore Stream',
          subtitle: 'Curated financial pathways',
        };
    }
  }, [stream]);

  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => {
        const goalStream = (g as any).stream || 'money_foundations';
        return goalStream === stream;
      })
      .sort((a, b) => (b.sortWeight || 0) - (a.sortWeight || 0));
  }, [goals, stream]);

  const diffGroups = useMemo(() => {
    return {
      beginner: filteredGoals.filter((g) => g.difficulty === 'beginner'),
      intermediate: filteredGoals.filter((g) => g.difficulty === 'intermediate'),
      advanced: filteredGoals.filter((g) => g.difficulty === 'advanced'),
    };
  }, [filteredGoals]);

  // Bottom Sheet Actions
  const openConfirmSheet = (goalId: string) => {
    setConfirmGoalId(goalId);
    sheetTranslateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    sheetBackdropOpacity.value = withTiming(0.6, { duration: 300 });
  };

  const closeConfirmSheet = () => {
    sheetTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
      runOnJS(setConfirmGoalId)(null);
    });
    sheetBackdropOpacity.value = withTiming(0, { duration: 250 });
  };

  // Toast Action
  const showToast = (message: string) => {
    setToastText(message);
    toastTranslateY.value = withTiming(20, { duration: 350, easing: Easing.out(Easing.back(1.5)) });
    toastOpacity.value = withTiming(1, { duration: 350 });

    setTimeout(() => {
      toastTranslateY.value = withTiming(-100, { duration: 300 });
      toastOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setToastText)(null);
      });
    }, 2000);
  };

  const handleStartPlan = async () => {
    if (!confirmGoalId) return;
    const goalId = confirmGoalId;

    closeConfirmSheet();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { planId, error } = await createPlan(goalId);
    if (error) {
      console.error('createPlan error:', error);
      return;
    }

    // Wait for sheet close animation to finish before navigating
    setTimeout(() => {
      router.push(`/plans/${planId}` as any);
    }, 300);
  };

  const handleToggleSaved = (goalId: string) => {
    if (isSaved(goalId)) {
      unsavePlan(goalId);
    } else {
      savePlan(goalId);
    }
  };

  const handleOpenGoal = (goalId: string) => {
    const activePlan = userPlans.find((p) => p.goals?.slug === goalId && p.status === 'active');
    if (activePlan) {
      router.push(`/plans/${activePlan.id}` as any);
    } else {
      router.push({ pathname: '/plan/[id]', params: { id: goalId } } as any);
    }
  };

  const openPaywall = () => router.push('/onboarding/paywall' as any);

  const confirmGoal = useMemo(() => {
    if (!confirmGoalId) return null;
    return goals.find((g) => g.id === confirmGoalId);
  }, [confirmGoalId, goals]);

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: sheetBackdropOpacity.value,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: sheetTranslateY.value }],
    };
  });

  const toastStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: toastTranslateY.value }],
      opacity: toastOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {toastText && (
        <Animated.View style={[styles.toast, toastStyle]}>
          <Check size={18} color="#ffffff" />
          <Text style={styles.toastText}>{toastText}</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.streamIcon}>{streamMeta.icon}</Text>
          <Text style={styles.title}>{streamMeta.title}</Text>
          <Text style={styles.subtitle}>{streamMeta.subtitle}</Text>
        </View>

        {/* Goals Grouped by Difficulty */}
        <View style={styles.feed}>
          {diffGroups.beginner.length > 0 && (
            <View>
              <DifficultyDivider label="Beginner" />
              <View style={styles.goalList}>
                {diffGroups.beginner.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    saved={isSaved(goal.id)}
                    active={isActive(goal.id)}
                    onToggleSaved={handleToggleSaved}
                    onOpen={handleOpenGoal}
                    onLocked={openPaywall}
                    onRequestStartPlan={openConfirmSheet}
                  />
                ))}
              </View>
            </View>
          )}

          {diffGroups.intermediate.length > 0 && (
            <View>
              <DifficultyDivider label="Intermediate" />
              <View style={styles.goalList}>
                {diffGroups.intermediate.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    saved={isSaved(goal.id)}
                    active={isActive(goal.id)}
                    onToggleSaved={handleToggleSaved}
                    onOpen={handleOpenGoal}
                    onLocked={openPaywall}
                    onRequestStartPlan={openConfirmSheet}
                  />
                ))}
              </View>
            </View>
          )}

          {diffGroups.advanced.length > 0 && (
            <View>
              <DifficultyDivider label="Advanced" />
              <View style={styles.goalList}>
                {diffGroups.advanced.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    saved={isSaved(goal.id)}
                    active={isActive(goal.id)}
                    onToggleSaved={handleToggleSaved}
                    onOpen={handleOpenGoal}
                    onLocked={openPaywall}
                    onRequestStartPlan={openConfirmSheet}
                  />
                ))}
              </View>
            </View>
          )}

          {filteredGoals.length === 0 && (
            <Text style={styles.empty}>No goals in this stream yet.</Text>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Bottom Sheet */}
      {confirmGoalId && (
        <Modal transparent visible={!!confirmGoalId} animationType="none" onRequestClose={closeConfirmSheet}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.modalBackdrop} onPress={closeConfirmSheet}>
              <Animated.View style={[styles.backdropFill, backdropStyle]} />
            </Pressable>
            
            <Animated.View style={[styles.sheet, sheetStyle]}>
              <View style={styles.sheetHeader}>
                <View style={styles.dragIndicator} />
              </View>
              <View style={styles.sheetBody}>
                <Text style={styles.sheetTitle}>Start this plan?</Text>
                {confirmGoal && (
                  <Text style={styles.sheetSubtitle}>
                    Generate your custom 5-step timeline for "{confirmGoal.title}". Let's get Stacked!
                  </Text>
                )}
                <View style={styles.sheetButtons}>
                  <Pressable style={styles.btnSecondary} onPress={closeConfirmSheet}>
                    <Text style={styles.btnSecondaryText}>Not now</Text>
                  </Pressable>
                  <Pressable style={styles.btnPrimary} onPress={handleStartPlan}>
                    <Text style={styles.btnPrimaryText}>Start Plan →</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  back: { width: 40, height: 40, justifyContent: 'center', marginTop: spacing.sm },

  header: { gap: 6, marginTop: spacing.xs },
  streamIcon: { fontSize: 32 },
  title: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash, lineHeight: 18 },

  feed: { gap: spacing.xl, marginTop: spacing.sm },
  goalList: { gap: spacing.md },
  empty: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },

  // Toast Styles
  toast: {
    position: 'absolute',
    top: 50,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.brandGreen,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    zIndex: 9999,
  },
  toastText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#ffffff',
  },

  // Bottom Sheet Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropFill: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sheet: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderBottomWidth: 0,
    paddingBottom: 40,
  },
  sheetHeader: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3c3c3c',
  },
  sheetBody: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    lineHeight: 20,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btnPrimary: {
    flex: 1,
    height: 56,
    backgroundColor: colors.brandGreen,
    borderBottomWidth: 3,
    borderBottomColor: colors.brandGreenBorder,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  btnSecondary: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#3c3c3c',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ash,
  },
});
