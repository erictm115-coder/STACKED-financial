import { useRouter } from 'expo-router';
import { Info, Search, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoalRow } from '@/components/discover/GoalRow';
import { GoalIcon } from '@/components/main/GoalIcon';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { goalMetaLabel, GOALS } from '@/data/goals';
import { recommendedGoal } from '@/lib/recommend';
import { useAppStore } from '@/store/appStore';
import { useOnboardingStore } from '@/store/onboardingStore';

type Tab = 'unexplored' | 'saved';

/** Derive a friendly first name from the captured email, else a generic greeting. */
function useFirstName(): string {
  const email = useOnboardingStore((s) => s.answers.email);
  if (!email) return 'there';
  const local = email.split('@')[0].split(/[._-]/)[0];
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'there';
}

export default function Discover() {
  const router = useRouter();
  const firstName = useFirstName();
  const scores = useOnboardingStore((s) => s.scores);
  const savedGoalIds = useAppStore((s) => s.savedGoalIds);
  const toggleSaved = useAppStore((s) => s.toggleSaved);

  const [tab, setTab] = useState<Tab>('unexplored');
  const [query, setQuery] = useState('');

  const recommended = useMemo(() => recommendedGoal(scores), [scores]);

  const visibleGoals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GOALS.filter((g) => {
      if (tab === 'saved' && !savedGoalIds.includes(g.id)) return false;
      if (q && !g.title.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.sortWeight - a.sortWeight);
  }, [tab, query, savedGoalIds]);

  const openPlan = (goalId: string) =>
    router.push({ pathname: '/plan/[id]', params: { id: goalId } });
  const openPaywall = () => router.push('/onboarding/paywall');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
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
          <Pressable style={styles.filterBtn} hitSlop={6}>
            <SlidersHorizontal size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Toggle pills */}
        <View style={styles.pills}>
          <Pressable
            style={[styles.pill, tab === 'unexplored' && styles.pillActive]}
            onPress={() => setTab('unexplored')}
          >
            <Text style={[styles.pillText, tab === 'unexplored' && styles.pillTextActive]}>
              Unexplored
            </Text>
          </Pressable>
          <Pressable
            style={[styles.pill, tab === 'saved' && styles.pillActive]}
            onPress={() => setTab('saved')}
          >
            <Text style={[styles.pillText, tab === 'saved' && styles.pillTextActive]}>
              Saved ({savedGoalIds.length})
            </Text>
          </Pressable>
        </View>

        {/* Recommended-for-you strip (only on the Unexplored tab, no active search) */}
        {tab === 'unexplored' && query.trim() === '' && (
          <View style={styles.recSection}>
            <View style={styles.recHeader}>
              <Sparkles size={15} color={colors.brandGreen} />
              <Text style={styles.recHeaderText}>Recommended for you</Text>
            </View>
            <Pressable style={styles.recCard} onPress={() => openPlan(recommended.id)}>
              <View style={styles.recIconWrap}>
                <GoalIcon iconKey={recommended.iconKey} size={24} />
              </View>
              <View style={styles.recTextBlock}>
                <Text style={styles.recTitle}>{recommended.title}</Text>
                <Text style={styles.recMeta}>{goalMetaLabel(recommended)}</Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Swipe hint */}
        <View style={styles.hintRow}>
          <Info size={14} color={colors.ash} />
          <Text style={styles.hintText}>Swipe right on a goal to create a plan</Text>
        </View>

        {/* Goal list */}
        <View style={styles.list}>
          {visibleGoals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              saved={savedGoalIds.includes(goal.id)}
              onToggleSaved={() => toggleSaved(goal.id)}
              onOpen={() => openPlan(goal.id)}
              onLocked={openPaywall}
            />
          ))}

          {visibleGoals.length === 0 && (
            <Text style={styles.empty}>
              {tab === 'saved'
                ? 'No saved goals yet — tap the bookmark on any goal to save it.'
                : 'No goals match your search.'}
            </Text>
          )}
        </View>
      </ScrollView>
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

  pills: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.graphite,
  },
  pillActive: { borderColor: colors.brandGreen, backgroundColor: '#0a2200' },
  pillText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ash },
  pillTextActive: { color: colors.brandGreen },

  recSection: { gap: spacing.sm },
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recHeaderText: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSecondary },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.brandGreenOutline,
    borderRadius: radius.card,
    padding: spacing.lg,
  },
  recIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  recTextBlock: { flex: 1, gap: 2 },
  recTitle: { fontFamily: fonts.extraBold, fontSize: 17, color: colors.textPrimary },
  recMeta: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.ash },

  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
  hintText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash },

  list: { gap: spacing.md },
  empty: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.ash,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
