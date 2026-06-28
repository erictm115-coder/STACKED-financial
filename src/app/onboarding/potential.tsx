import { useRouter } from 'expo-router';
import { BarChart2, Crosshair, Eye, Lightbulb, TrendingUp, Zap } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      icon: <TrendingUp size={16} color={GREEN} />,
      label: 'Overall',
      score: potential.overall,
      delta: potential.overall - currentScores.overall,
    },
    {
      icon: <Lightbulb size={16} color={colors.accentBlue} />,
      label: 'Money Mindset',
      score: potential.moneyMindset,
      delta: potential.moneyMindset - currentScores.moneyMindset,
    },
    {
      icon: <Eye size={16} color={colors.brandGreenOutline} />,
      label: 'Clarity',
      score: potential.clarity,
      delta: potential.clarity - currentScores.clarity,
    },
    {
      icon: <Zap size={16} color="#f4c430" />,
      label: 'Discipline',
      score: potential.discipline,
      delta: potential.discipline - currentScores.discipline,
    },
    {
      icon: <Crosshair size={16} color={colors.brandGreen} />,
      label: 'Focus',
      score: potential.focus,
      delta: potential.focus - currentScores.focus,
    },
    {
      icon: <BarChart2 size={16} color={colors.accentBlue} />,
      label: 'Investment Readiness',
      score: potential.investmentReadiness,
      delta: potential.investmentReadiness - currentScores.investmentReadiness,
    },
  ];
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>Your Potential Stacked Score</Text>
        <Text style={styles.subtitle}>
          Based on your answers, we believe you have the potential to reach a {potential.overall}{' '}
          overall score using Stacked — and finally take control of your financial future.
        </Text>

        <View style={styles.grid}>
          {cards.map((c, idx) => (
            <View key={c.label} style={styles.cardWrapper}>
              <ScoreCard
                icon={c.icon}
                label={c.label}
                score={c.score}
                delta={c.delta}
                isHigh
                delayMs={idx * STAGGER_MS}
              />
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            label="ENTER THE APP →"
            onPress={() => router.push('/onboarding/notifications')}
          />
        </View>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary, marginTop: 20 },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.ash,
    marginTop: 8,
    marginBottom: 16,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cardWrapper: {
    width: '50%',
    height: '33.33%',
    padding: 6,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
});
