import { useRouter } from 'expo-router';
import { BarChart2, Crosshair, Eye, Lightbulb, TrendingUp, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    { icon: <TrendingUp size={16} color={RED} />, label: 'Overall', score: scores.overall },
    {
      icon: <Lightbulb size={16} color={colors.accentBlue} />,
      label: 'Money Mindset',
      score: scores.moneyMindset,
    },
    {
      icon: <Eye size={16} color={colors.brandGreenOutline} />,
      label: 'Clarity',
      score: scores.clarity,
    },
    { icon: <Zap size={16} color="#f4c430" />, label: 'Discipline', score: scores.discipline },
    {
      icon: <Crosshair size={16} color={colors.brandGreen} />,
      label: 'Focus',
      score: scores.focus,
    },
    {
      icon: <BarChart2 size={16} color={colors.accentBlue} />,
      label: 'Investment Readiness',
      score: scores.investmentReadiness,
    },
  ];
  const rows = [cards.slice(0, 2), cards.slice(2, 4), cards.slice(4, 6)];

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>Your Stacked Score</Text>
        <Text style={styles.subtitle}>
          Based on your answers, here is your Stacked Score. The higher the rating, the closer you
          are to true financial freedom.
        </Text>

        <View style={styles.grid}>
          {rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((c, j) => (
                <ScoreCard
                  key={c.label}
                  icon={c.icon}
                  label={c.label}
                  score={c.score}
                  isHigh={false}
                  delayMs={(i * 2 + j) * STAGGER_MS}
                />
              ))}
            </View>
          ))}
        </View>

        <PrimaryButton
          label="Show my potential score →"
          onPress={() => router.push('/onboarding/potential')}
        />
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ash,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  grid: { flex: 1, gap: spacing.sm },
  row: { flex: 1, flexDirection: 'row', gap: spacing.sm },
});
