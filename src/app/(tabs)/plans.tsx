import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Layers, Flame, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react-native';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PlanCard } from '@/components/plans/PlanCard';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { usePlans, type UserPlan } from '@/hooks/usePlans';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function Plans() {
  const router = useRouter();
  const { user } = useAuth();
  const { userPlans, isLoading, refresh } = usePlans();
  
  const [streak, setStreak] = useState(0);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [sortAsc, setSortAsc] = useState(false); // toggle sort order by created_at

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_gamification')
      .select('day_streak')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.day_streak) setStreak(data.day_streak);
      });
  }, [user, userPlans]);

  // Refresh on focus
  useEffect(() => {
    refresh();
  }, []);

  // Categorize plans
  const categorizedPlans = useMemo(() => {
    const plansWithProgress = userPlans.map((plan) => {
      const completedSteps = plan.user_step_progress.filter((p) => p.completed).length;
      return {
        ...plan,
        completedSteps,
        progressPercent: (completedSteps / 5) * 100,
      };
    });

    // Sort plans by created_at
    const sorted = [...plansWithProgress].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    });

    return {
      inProgress: sorted.filter((p) => p.status === 'active' && p.completedSteps > 0),
      notStarted: sorted.filter((p) => p.status === 'active' && p.completedSteps === 0),
      completed: sorted.filter((p) => p.status === 'completed' || p.completedSteps === 5),
    };
  }, [userPlans, sortAsc]);

  const toggleSort = () => {
    setSortAsc(!sortAsc);
  };

  const hasPlans = userPlans.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plans</Text>
        {hasPlans && (
          <Pressable style={styles.sortBtn} onPress={toggleSort} hitSlop={8}>
            <ArrowUpDown size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {streak > 0 && (
        <View style={styles.streakNudge}>
          <Flame size={24} color="#ff9600" fill="#ff9600" />
          <Text style={styles.streakText}>
            Keep your {streak}-day streak! Complete 1 step today.
          </Text>
        </View>
      )}

      {hasPlans ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* In Progress Section */}
          {categorizedPlans.inProgress.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionDivider}>
                <View style={styles.line} />
                <Text style={styles.sectionLabel}>IN PROGRESS</Text>
                <View style={styles.line} />
              </View>
              <View style={styles.list}>
                {categorizedPlans.inProgress.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </View>
            </View>
          )}

          {/* Not Started Section */}
          {categorizedPlans.notStarted.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionDivider}>
                <View style={styles.line} />
                <Text style={styles.sectionLabel}>NOT STARTED</Text>
                <View style={styles.line} />
              </View>
              <View style={styles.list}>
                {categorizedPlans.notStarted.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </View>
            </View>
          )}

          {/* Completed Section */}
          {categorizedPlans.completed.length > 0 && (
            <View style={styles.section}>
              <Pressable
                style={styles.sectionDivider}
                onPress={() => setCompletedExpanded(!completedExpanded)}
              >
                <View style={styles.line} />
                <View style={styles.completedHeader}>
                  <Text style={styles.sectionLabel}>COMPLETED</Text>
                  {completedExpanded ? (
                    <ChevronUp size={14} color="#555555" />
                  ) : (
                    <ChevronDown size={14} color="#555555" />
                  )}
                </View>
                <View style={styles.line} />
              </Pressable>
              {completedExpanded && (
                <View style={styles.list}>
                  {categorizedPlans.completed.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Discover More Goals Button */}
          <Pressable style={styles.ghostBtn} onPress={() => router.push('/discover')}>
            <Text style={styles.ghostBtnText}>+ Discover More Goals</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Layers size={48} color={colors.graphite} />
          <Text style={styles.emptyTitle}>No active plans yet</Text>
          <Text style={styles.emptyBody}>
            Find a money goal in Discover and swipe right to generate your first plan.
          </Text>
          <View style={styles.cta}>
            <PrimaryButton label="Browse goals" onPress={() => router.push('/discover')} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// Custom memoized wrapper for logic
import { useMemo } from 'react';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.graphite,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary },
  emptyBody: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    lineHeight: 21,
  },
  cta: { width: '100%', marginTop: spacing.md },

  streakNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#2a1a00',
    borderWidth: 1.5,
    borderColor: '#ff9600',
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  streakText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#ff9600',
    flex: 1,
  },

  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#555555',
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  list: {
    gap: spacing.md,
  },
  ghostBtn: {
    height: 56,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.graphite,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  ghostBtnText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ash,
  },
});
