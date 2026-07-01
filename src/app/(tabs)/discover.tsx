import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ArrowRightLeft, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { GoalRow } from '@/components/discover/GoalRow';
import { DifficultyDivider } from '@/components/discover/DifficultyDivider';
import { RecommendedStrip } from '@/components/discover/RecommendedStrip';
import { StreamTabs, type Stream } from '@/components/discover/StreamTabs';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useEntitlementStatus } from '@/lib/purchases';
import { usePlans } from '@/hooks/usePlans';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { type Goal } from '@/data/goals';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const dimensionToGoals: Record<string, string[]> = {
  investment_readiness: ['start-investing-index-funds', 'fix-credit-score', 'build-emergency-fund'],
  discipline:           ['master-budgeting', 'wealthy-morning-routine', 'get-out-of-debt'],
  clarity:              ['get-out-of-debt', 'master-budgeting', 'fix-credit-score'],
  money_mindset:        ['read-like-the-wealthy', 'master-negotiation', 'wealthy-morning-routine'],
  focus:                ['wealthy-morning-routine', 'public-speaking-communication', 'read-like-the-wealthy'],
  overall:              ['get-out-of-debt', 'build-emergency-fund', 'start-investing-index-funds'],
};

type Tab = 'unexplored' | 'saved';

export default function Discover() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPro } = useEntitlementStatus();
  
  const goals = useAppStore((s) => s.goals);
  const fetchCatalog = useAppStore((s) => s.fetchCatalog);
  const isLoadingCatalog = useAppStore((s) => s.isLoading);
  const catalogError = useAppStore((s) => s.error);
  
  const {
    createPlan,
    savePlan,
    unsavePlan,
    isSaved,
    isActive,
    isCompleted,
    userPlans,
    refresh,
  } = usePlans();

  const [tab, setTab] = useState<Tab>('unexplored');
  const [deferredTab, setDeferredTab] = useState<Tab>('unexplored');
  const [query, setQuery] = useState('');
  const [activeStream, setActiveStream] = useState<Stream>('money_foundations');
  const [deferredStream, setDeferredStream] = useState<Stream>('money_foundations');
  
  // Custom bottom sheet & toast state
  const [confirmGoalId, setConfirmGoalId] = useState<string | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [userScores, setUserScores] = useState<any>(null);

  // Reanimated values for Bottom Sheet
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);
  const sheetBackdropOpacity = useSharedValue(0);

  // Reanimated values for Toast
  const toastTranslateY = useSharedValue(-100);
  const toastOpacity = useSharedValue(0);

  // Reanimated value for Feed transition opacity
  const feedOpacity = useSharedValue(1);

  // Restore last stream tab on mount
  useEffect(() => {
    AsyncStorage.getItem('lastActiveStream').then((val) => {
      if (val) {
        setActiveStream(val as Stream);
        setDeferredStream(val as Stream);
      }
    });
  }, []);

  const handleStreamChange = (stream: Stream) => {
    setActiveStream(stream);
    feedOpacity.value = 0;
    setTimeout(() => {
      setDeferredStream(stream);
      feedOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    }, 50);
    AsyncStorage.setItem('lastActiveStream', stream);
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    feedOpacity.value = 0;
    setTimeout(() => {
      setDeferredTab(newTab);
      feedOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    }, 50);
  };

  const animatedFeedStyle = useAnimatedStyle(() => {
    return {
      opacity: feedOpacity.value,
    };
  });

  // Refetch data on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchCatalog();
      refresh();
    }, [fetchCatalog, refresh])
  );

  // Fetch scores for recommendation
  useEffect(() => {
    if (!user) return;
    supabase
      .from('stacked_scores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setUserScores(data);
      });
  }, [user]);

  const firstName = useMemo(() => {
    const email = user?.email;
    if (!email) return 'there';
    const local = email.split('@')[0].split(/[._-]/)[0];
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'there';
  }, [user]);

  const recommendedGoals = useMemo(() => {
    if (goals.length === 0) return [];
    
    const dimensions = ['investment_readiness', 'discipline', 'clarity', 'money_mindset', 'focus'];
    let weakestDim = 'overall';
    
    if (userScores) {
      weakestDim = dimensions.reduce((lowest, dim) => {
        const lowestVal = userScores[lowest] ?? 0;
        const currentVal = userScores[dim] ?? 0;
        return currentVal < lowestVal ? dim : lowest;
      }, 'investment_readiness');
    }

    const recommendedSlugs = dimensionToGoals[weakestDim] || dimensionToGoals['overall'];
    return goals.filter((g) => recommendedSlugs.includes(g.id));
  }, [goals, userScores]);

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

    // Auto dismiss after 2s
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

    // Close sheet first — let the 250ms close animation finish before any navigation
    closeConfirmSheet();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { planId, error } = await createPlan(goalId);
    if (error) {
      console.error('createPlan error:', error);
      return;
    }

    // Brief delay so sheet close animation completes before we push a new screen
    // This prevents the double-mount/render caused by navigating mid-animation
    setTimeout(() => {
      router.push(`/plans/${planId}` as any);
    }, 300);
  };

  const handleToggleSaved = (goalId: string) => {
    if (isSaved(goalId)) {
      unsavePlan(goalId);
      showToast('Removed from saved plans');
    } else {
      savePlan(goalId);
      showToast('Saved to your plans!');
    }
  };

  const handleOpenGoal = (goalId: string) => {
    // If active, route directly to plans details. Else route to static preview/teaser page
    const activePlan = userPlans.find((p) => p.goals?.slug === goalId && p.status === 'active');
    if (activePlan) {
      router.push(`/plans/${activePlan.id}` as any);
    } else {
      router.push({ pathname: '/plan/[id]', params: { id: goalId } } as any);
    }
  };

  const openPaywall = () => router.push('/onboarding/paywall');

  const confirmGoal = useMemo(() => {
    if (!confirmGoalId) return null;
    return goals.find((g) => g.id === confirmGoalId);
  }, [confirmGoalId, goals]);

  // Goal visual status helper
  const getGoalStatus = (goalId: string) => {
    if (isCompleted(goalId)) return 'completed';
    if (isActive(goalId)) return 'active';
    return 'not_started';
  };

  // Goal progress percent helper
  const getProgressPercent = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    const dbGoalId = goal?.databaseId || goalId;
    const plan = userPlans.find((p) => p.goal_id === dbGoalId);
    if (!plan) return undefined;
    const completed = plan.user_step_progress?.filter((p) => p.completed).length ?? 0;
    return (completed / 5) * 100;
  };

  // Section / group goals
  const streams = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = goals.filter((g) => {
      if (deferredTab === 'saved' && !isSaved(g.id)) return false;
      if (q && !g.title.toLowerCase().includes(q)) return false;
      return true;
    });

    const groups = {
      money_foundations: [] as Goal[],
      income_builders: [] as Goal[],
      wealthy_habits: [] as Goal[],
    };

    filtered.forEach((g) => {
      // Find stream
      if (g.sortWeight !== undefined) {
        const stream = (g as any).stream || 'money_foundations';
        if (stream in groups) {
          groups[stream as keyof typeof groups].push(g);
        } else {
          groups.money_foundations.push(g);
        }
      }
    });

    // Sort by weight descending inside each group
    Object.keys(groups).forEach((key) => {
      groups[key as keyof typeof groups].sort((a, b) => (b.sortWeight || 0) - (a.sortWeight || 0));
    });

    return groups;
  }, [goals, query, deferredTab, userPlans, isSaved]);

  const renderSearchList = () => {
    const q = query.trim().toLowerCase();
    const filtered = goals.filter((g) => {
      if (deferredTab === 'saved' && !isSaved(g.id)) return false;
      return g.title.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      return <Text style={styles.empty}>No goals match your search.</Text>;
    }

    return (
      <View style={styles.goalList}>
        {filtered.map((goal) => (
          <GoalRow
            key={goal.id}
            goal={goal}
            saved={isSaved(goal.id)}
            status={getGoalStatus(goal.id)}
            progressPercent={getProgressPercent(goal.id)}
            hasPro={hasPro}
            onToggleSaved={handleToggleSaved}
            onOpen={handleOpenGoal}
            onLocked={openPaywall}
            onRequestStartPlan={openConfirmSheet}
          />
        ))}
      </View>
    );
  };

  const renderStreamSection = (streamKey: 'money_foundations' | 'income_builders' | 'wealthy_habits') => {
    const group = streams[streamKey];
    if (group.length === 0) {
      return <Text style={styles.empty}>No goals in this stream yet.</Text>;
    }

    // Group goals by difficulty
    const diffGroups = {
      beginner: group.filter((g) => g.difficulty === 'beginner'),
      intermediate: group.filter((g) => g.difficulty === 'intermediate'),
      advanced: group.filter((g) => g.difficulty === 'advanced'),
    };

    return (
      <View style={styles.section}>
        {diffGroups.beginner.length > 0 && (
          <View>
            <View style={styles.hintRow}>
              <ArrowRightLeft size={14} color={colors.ash} />
              <Text style={styles.hintText}>Swipe right to Start Plan, swipe left to Save</Text>
            </View>
            <DifficultyDivider label="Beginner" />
            <View style={styles.goalList}>
              {diffGroups.beginner.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  saved={isSaved(goal.id)}
                  status={getGoalStatus(goal.id)}
                  progressPercent={getProgressPercent(goal.id)}
                  hasPro={hasPro}
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
                  status={getGoalStatus(goal.id)}
                  progressPercent={getProgressPercent(goal.id)}
                  hasPro={hasPro}
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
                  status={getGoalStatus(goal.id)}
                  progressPercent={getProgressPercent(goal.id)}
                  hasPro={hasPro}
                  onToggleSaved={handleToggleSaved}
                  onOpen={handleOpenGoal}
                  onLocked={openPaywall}
                  onRequestStartPlan={openConfirmSheet}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

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
      {/* Toast Alert overlay */}
      {toastText && (
        <Animated.View style={[styles.toast, toastStyle]}>
          <Check size={18} color="#ffffff" />
          <Text style={styles.toastText}>{toastText}</Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Greeting banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Hey there, {firstName}!</Text>
          <Text style={styles.bannerSubtitle}>Ready to build your stack today?</Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color={colors.ash} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search money goals..."
              placeholderTextColor={colors.ash}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Toggle pills */}
        <View style={styles.pills}>
          <Pressable
            style={[styles.pill, tab === 'unexplored' && styles.pillActive]}
            onPress={() => handleTabChange('unexplored')}
          >
            <Text style={[styles.pillText, tab === 'unexplored' && styles.pillTextActive]}>
              Unexplored
            </Text>
          </Pressable>
          <Pressable
            style={[styles.pill, tab === 'saved' && styles.pillActive]}
            onPress={() => handleTabChange('saved')}
          >
            <Text style={[styles.pillText, tab === 'saved' && styles.pillTextActive]}>
              Saved ({goals.filter((g) => isSaved(g.id)).length})
            </Text>
          </Pressable>
        </View>

        {/* Recommended Strip (Horizontal) */}
        {deferredTab === 'unexplored' && query.trim() === '' && recommendedGoals.length > 0 && (
          <RecommendedStrip goals={recommendedGoals} onOpenGoal={handleOpenGoal} />
        )}

        {/* Segmented stream tabs (only when search query is empty) */}
        {query.trim() === '' && (
          <StreamTabs
            activeStream={activeStream}
            onChangeStream={handleStreamChange}
          />
        )}

        <Animated.View
          style={[styles.feed, animatedFeedStyle]}
        >
          {goals.length === 0 ? (
            isLoadingCatalog ? (
              <View style={styles.feedState}>
                <ActivityIndicator color={colors.brandGreen} />
              </View>
            ) : catalogError ? (
              <View style={styles.feedState}>
                <Text style={styles.feedStateText}>
                  Couldn&apos;t load goals. Check your connection and try again.
                </Text>
                <Pressable style={styles.retryBtn} onPress={() => fetchCatalog()}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.empty}>No goals available yet.</Text>
            )
          ) : query.trim() !== '' ? (
            renderSearchList()
          ) : (
            renderStreamSection(deferredStream)
          )}
        </Animated.View>
      </ScrollView>

      {/* Confirmation Bottom Sheet (Modal Overlay) */}
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
                    Generate your custom 5-step timeline for &quot;{confirmGoal.title}&quot;. Let&apos;s get Stacked!
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

  banner: {
    backgroundColor: colors.brandGreen,
    borderRadius: radius.card,
    borderBottomWidth: 4,
    borderBottomColor: colors.brandGreenBorder,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  bannerTitle: { fontFamily: fonts.extraBold, fontSize: 22, color: colors.textPrimary },
  bannerSubtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
    opacity: 0.9,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  filterBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.input,
  },

  pills: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.graphite,
  },
  pillActive: { borderColor: colors.brandGreen, backgroundColor: '#0a2200' },
  pillText: { fontFamily: fonts.bold, fontSize: 13, color: colors.ash },
  pillTextActive: { color: colors.brandGreen },

  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  hintText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash },

  feed: { gap: spacing.xl },
  section: { gap: spacing.sm },
  goalList: { gap: spacing.md },
  empty: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
  feedState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl * 2,
  },
  feedStateText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.brandGreen,
  },
  retryText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.brandGreen,
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
    paddingBottom: 40, // safe area padding
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
