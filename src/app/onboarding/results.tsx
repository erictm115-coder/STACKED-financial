import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingData } from '@/hooks/useOnboardingData';
import type { Scores } from '@/lib/calculateScores';
import { useOnboardingStore } from '@/store/onboardingStore';

const RED = '#ff4b4b';
const STAGGER_MS = 100;

export default function Results() {
  const router = useRouter();
  const { user } = useAuth();
  const { getScores } = useOnboardingData();
  const storeScores = useOnboardingStore((s) => s.scores);
  const setScores = useOnboardingStore((s) => s.setScores);
  const [scores, setLocalScores] = useState<Scores | null>(storeScores);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user) return;
      const { data } = await getScores(user.id);
      if (mounted && data) {
        setLocalScores(data);
        setScores(data);
      }
      // On error or no row yet, silently keep the locally-computed fallback
      // already set by verify.tsx — no need to surface this to the user.
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!scores) return null;

  const cards = [
    { icon: <OverallIcon color={RED} />, label: 'Overall', score: scores.overall },
    { icon: <MoneyMindsetIcon />, label: 'Money Mindset', score: scores.moneyMindset },
    { icon: <ClarityIcon />, label: 'Clarity', score: scores.clarity },
    { icon: <DisciplineIcon />, label: 'Discipline', score: scores.discipline },
    { icon: <FocusIcon />, label: 'Focus', score: scores.focus },
    { icon: <InvestmentIcon />, label: 'Investment Readiness', score: scores.investmentReadiness },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScreenEntrance>
          <Text style={styles.title}>Your Stacked Score</Text>
          <Text style={styles.subtitle}>
            Based on your answers, here is your Stacked Score. The higher the rating, the closer you
            are to true financial freedom.
          </Text>

          <View style={styles.grid}>
            {cards.map((c, i) => (
              <View key={c.label} style={styles.gridItem}>
                <ScoreCard
                  icon={c.icon}
                  label={c.label}
                  score={c.score}
                  isHigh={false}
                  delayMs={i * STAGGER_MS}
                />
              </View>
            ))}
          </View>
        </ScreenEntrance>
      </ScrollView>

      <View style={styles.cta}>
        <PrimaryButton
          label="Show my potential score →"
          onPress={() => router.push('/onboarding/potential')}
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
