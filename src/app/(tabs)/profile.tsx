import { Flame, Gem, Coins } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useOnboardingStore } from '@/store/onboardingStore';

const STATS = [
  { icon: <Flame size={22} color="#ff7a1a" />, value: '5', label: 'Day Streak' },
  { icon: <Coins size={22} color="#f4c430" />, value: '12', label: 'Stacks' },
  { icon: <Gem size={22} color={colors.accentBlue} />, value: '3', label: 'Credits' },
];

export default function Profile() {
  const { resetOnboarding } = useOnboarding();
  const overall = useOnboardingStore((s) => s.scores?.overall ?? 58);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Profile</Text>

      {/* League badge */}
      <View style={styles.badge}>
        <Coins size={40} color={colors.brandGreen} />
      </View>
      <Text style={styles.league}>Beginner League</Text>
      <Text style={styles.leagueSub}>1 stack until Challenger League</Text>

      {/* Stack Score card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Your Stack Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{overall}</Text>
          <Text style={styles.scoreDelta}>▲ +8 this week</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.statCard}>
            {s.icon}
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      {/* DEV ONLY: clear the AsyncStorage flag to replay onboarding. */}
      <View style={styles.devBox}>
        <Text style={styles.devLabel}>DEV</Text>
        <PrimaryButton label="Reset onboarding" onPress={resetOnboarding} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, marginTop: spacing.md },

  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brandGreenOutline,
    marginTop: spacing.xl,
  },
  league: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  leagueSub: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.ash,
    textAlign: 'center',
    marginTop: 2,
  },

  scoreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.graphite,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  scoreLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.ash },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 },
  scoreValue: { fontFamily: fonts.black, fontSize: 40, color: colors.textPrimary },
  scoreDelta: { fontFamily: fonts.bold, fontSize: 13, color: colors.brandGreen },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
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
  statValue: { fontFamily: fonts.black, fontSize: 20, color: colors.textPrimary },
  statLabel: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.ash },

  spacer: { flex: 1 },
  devBox: { paddingBottom: spacing.xl, gap: spacing.sm },
  devLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.textMuted, letterSpacing: 1 },
});
