import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, spacing } from '@/constants/theme';

const OVERALL = { icon: '🔴', label: 'Overall', score: 50 };

const METRICS = [
  { icon: '💡', label: 'Money Mindset', score: 51 },
  { icon: '🧠', label: 'Clarity', score: 64 },
  { icon: '⚡', label: 'Discipline', score: 40 },
  { icon: '🎯', label: 'Focus', score: 53 },
  { icon: '📈', label: 'Investment', score: 41 },
];

export default function Results() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenEntrance>
          <Text style={styles.title}>Your Wealth Score</Text>
          <Text style={styles.subtitle}>
            Based on your answers, here is your Wealth Score. The higher the rating, the closer you
            are to true financial freedom.
          </Text>

          <ScoreCard
            icon={OVERALL.icon}
            label={OVERALL.label}
            score={OVERALL.score}
            isHigh={false}
            fullWidth
          />

          <View style={styles.grid}>
            {METRICS.map((m) => (
              <View key={m.label} style={styles.gridItem}>
                <ScoreCard icon={m.icon} label={m.label} score={m.score} isHigh={false} />
              </View>
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="Show my potential score →"
              onPress={() => router.push('/onboarding/potential')}
            />
          </View>
        </ScreenEntrance>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ash,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridItem: { width: '47%' },
  cta: { marginTop: spacing.xxl },
});
