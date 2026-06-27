import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ClarityIcon,
  DisciplineIcon,
  FocusIcon,
  InvestmentIcon,
  MoneyMindsetIcon,
  OverallIcon,
} from '@/components/icons/ScoreIcons';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScoreCard } from '@/components/ui/ScoreCard';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, spacing } from '@/constants/theme';
import { calculatePotentialScores } from '@/lib/calculateScores';
import { useOnboardingStore } from '@/store/onboardingStore';

const GREEN = '#58cc02';
const STAGGER_MS = 100;

export default function Potential() {
  const router = useRouter();
  const currentScores = useOnboardingStore((s) => s.scores);

  if (!currentScores) return null;

  const potential = calculatePotentialScores(currentScores);

  const cards = [
    {
      icon: <OverallIcon color={GREEN} />,
      label: 'Overall',
      score: potential.overall,
      delta: potential.overall - currentScores.overall,
    },
    {
      icon: <MoneyMindsetIcon />,
      label: 'Money Mindset',
      score: potential.moneyMindset,
      delta: potential.moneyMindset - currentScores.moneyMindset,
    },
    {
      icon: <ClarityIcon />,
      label: 'Clarity',
      score: potential.clarity,
      delta: potential.clarity - currentScores.clarity,
    },
    {
      icon: <DisciplineIcon />,
      label: 'Discipline',
      score: potential.discipline,
      delta: potential.discipline - currentScores.discipline,
    },
    {
      icon: <FocusIcon />,
      label: 'Focus',
      score: potential.focus,
      delta: potential.focus - currentScores.focus,
    },
    {
      icon: <InvestmentIcon />,
      label: 'Investment Readiness',
      score: potential.investmentReadiness,
      delta: potential.investmentReadiness - currentScores.investmentReadiness,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenEntrance>
          <Text style={styles.title}>Your Potential Stacked Score</Text>
          <Text style={styles.subtitle}>
            Based on your answers, we believe you have the potential to reach a {potential.overall}{' '}
            overall score using Stacked — and finally take control of your financial future.
          </Text>

          <View style={styles.grid}>
            {cards.map((c, i) => (
              <View key={c.label} style={styles.gridItem}>
                <ScoreCard
                  icon={c.icon}
                  label={c.label}
                  score={c.score}
                  delta={c.delta}
                  isHigh
                  delayMs={i * STAGGER_MS}
                />
              </View>
            ))}
          </View>
        </ScreenEntrance>
      </ScrollView>

      <View style={styles.cta}>
        <PrimaryButton
          label="ENTER THE APP →"
          onPress={() => router.push('/onboarding/notifications')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 140 },
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
  },
  gridItem: { width: '47%' },
  cta: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 34,
  },
});
