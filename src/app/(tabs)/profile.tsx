import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Flame, Gem } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

import { StacksCard } from '@/components/profile/StacksCard';
import { SettingsSheet } from '@/components/profile/SettingsSheet';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Gamification {
  stack_count: number;
  day_streak: number;
}

export default function Profile() {
  const { user } = useAuth();
  const overall = useOnboardingStore((s) => s.scores?.overall ?? 58);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [gamification, setGamification] = useState<Gamification>({
    stack_count: 0,
    day_streak: 0,
  });
  const [scoreDelta, setScoreDelta] = useState(0);

  const fetchGamification = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_gamification')
      .select('total_stacks, day_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[profile] gamification fetch failed:', error.message);
      return;
    }

    if (data) {
      setGamification({
        stack_count: data.total_stacks ?? 0,
        day_streak: data.day_streak ?? 0,
      });
    }
  };

  const fetchScoreDelta = async () => {
    if (!user) return;
    // Pull weekly delta from stacked_scores (overall column acts as running total)
    const { data, error } = await supabase
      .from('stacked_scores')
      .select('overall')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[profile] score fetch failed:', error.message);
      return;
    }

    if (data?.overall) setScoreDelta(data.overall);
  };

  // ── Fetch live gamification data on focus ─────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      fetchGamification();
      fetchScoreDelta();
    }, [user])
  );

  // Realtime subscription so stack count updates without refresh
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-gamification')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_gamification',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setGamification({
            stack_count: updated.total_stacks ?? 0,
            day_streak: updated.day_streak ?? 0,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const STATS = [
    {
      icon: <Flame size={22} color="#ff7a1a" />,
      value: String(gamification.day_streak),
      label: 'Day Streak',
    },
    {
      icon: <Gem size={22} color={colors.accentBlue} />,
      value: String(overall),
      label: 'Stack Score',
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Pressable
            style={styles.gearBtn}
            onPress={() => setSettingsVisible(true)}
            hitSlop={10}
            accessibilityLabel="Open settings"
          >
            <Settings size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* ── League Avatar ── */}
        <View style={styles.avatarSection}>
          <Image
            source={require('../../../assets/images/appicon.png')}
            style={styles.avatarImage}
            contentFit="contain"
          />
          <Text style={styles.leagueName}>
            {gamification.stack_count >= 100
              ? 'Stacked Elite'
              : gamification.stack_count >= 50
              ? 'Wealth Maker'
              : gamification.stack_count >= 25
              ? 'Builder'
              : gamification.stack_count >= 10
              ? 'Challenger'
              : 'Beginner'}{' '}
            League
          </Text>
        </View>

        {/* ── Stack Score Card ── */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Stack Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{overall}</Text>
            {scoreDelta > 0 && (
              <Text style={styles.scoreDelta}>▲ {scoreDelta} total</Text>
            )}
          </View>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              {s.icon}
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Stacks Gamification Card ── */}
        <StacksCard stackCount={gamification.stack_count} />

        <View style={styles.spacer} />
      </ScrollView>

      {/* ── Settings Bottom Sheet ── */}
      <SettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  gearBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarImage: {
    width: 140,
    height: 140,
    borderRadius: 28,
  },
  leagueName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },

  // Score card
  scoreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  scoreLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ash,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scoreValue: {
    fontFamily: fonts.black,
    fontSize: 40,
    color: colors.textPrimary,
  },
  scoreDelta: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brandGreen,
  },

  // Quick stats row
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontFamily: fonts.black,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.ash,
  },

  spacer: { height: spacing.xl },
});
