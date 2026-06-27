import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, spacing } from '@/constants/theme';

const OVERALL = { icon: '🟢', label: 'Overall', score: 98, delta: 48 };

const METRICS = [
  { icon: '💡', label: 'Money Mindset', score: 99, delta: 48 },
  { icon: '🧠', label: 'Clarity', score: 96, delta: 32 },
  { icon: '⚡', label: 'Discipline', score: 98, delta: 58 },
  { icon: '🎯', label: 'Focus', score: 99, delta: 46 },
  { icon: '📈', label: 'Investment', score: 97, delta: 56 },
];

export default function Potential() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenEntrance>
          <Text style={styles.title}>Your Potential Wealth Score</Text>
          <Text style={styles.subtitle}>
            Based on your answers, we believe you have the potential to reach a 98 overall score
            using Stacked — and finally take control of your financial future.
          </Text>

          <ScoreCard
            icon={OVERALL.icon}
            label={OVERALL.label}
            score={OVERALL.score}
            delta={OVERALL.delta}
            isHigh
            fullWidth
          />

          <View style={styles.grid}>
            {METRICS.map((m) => (
              <View key={m.label} style={styles.gridItem}>
                <ScoreCard icon={m.icon} label={m.label} score={m.score} delta={m.delta} isHigh />
              </View>
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label="ENTER THE APP →"
              onPress={() => router.push('/onboarding/notifications')}
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
