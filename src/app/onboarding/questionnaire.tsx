import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnswerButton } from '@/components/ui/AnswerButton';
import { CheckButton } from '@/components/ui/CheckButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { StepProgressBar } from '@/components/ui/StepProgressBar';
import { colors, fonts, spacing } from '@/constants/theme';
import { OnboardingAnswers, useOnboardingStore } from '@/store/onboardingStore';

type StepConfig = {
  key: keyof OnboardingAnswers;
  title: string;
  subtitle: string;
  options: string[];
  layout: 'list' | 'grid';
  type: 'single' | 'multi';
  skip: boolean;
};

const MAX_HABITS = 2;

const STEPS: StepConfig[] = [
  {
    key: 'financeFrequency',
    title: 'How often do you think about your finances?',
    subtitle: "Be honest — this helps us understand where you're starting from.",
    layout: 'list',
    type: 'single',
    skip: false,
    options: [
      'Every day — it stresses me out',
      'A few times a week',
      'Once a month or so',
      'Rarely — I try not to think about it',
      'Never',
    ],
  },
  {
    key: 'lifeGoal',
    title: 'What do you actually want from life?',
    subtitle: "Think about it for a moment. You don't need to tell us if you don't want to.",
    layout: 'list',
    type: 'single',
    skip: true,
    options: [
      'Financial freedom',
      'To stop living paycheck to paycheck',
      'To wake up without money stress',
      'To feel in control of my future',
      'To retire early',
      "I don't know",
      'Many of the above',
    ],
  },
  {
    key: 'ageGroup',
    title: 'How old are you?',
    subtitle: 'So we can tailor your financial plan to what matters most right now.',
    layout: 'list',
    type: 'single',
    skip: true,
    options: ['Under 18', '18–24', '25–34', '35–44', '45–54', 'Over 55'],
  },
  {
    key: 'lastControl',
    title: 'When did you last feel completely in control of your money?',
    subtitle:
      'No judgment here — we want to help you get back to that feeling, and make it permanent.',
    layout: 'list',
    type: 'single',
    skip: false,
    options: [
      'This week',
      'In the last month',
      'In the last year',
      'A few years ago',
      'Many years ago',
      "I'm not sure I ever have…",
    ],
  },
  {
    key: 'resonatingWord',
    title: 'Which of the following words resonates with you the most?',
    subtitle: 'Pick the word that speaks to you the loudest.',
    layout: 'grid',
    type: 'single',
    skip: false,
    options: ['Trapped', 'Stressed', 'Confused', 'Motivated', 'Lost', 'Ready'],
  },
  {
    key: 'moneyHabits',
    title: 'Pick your two biggest money habits right now',
    subtitle:
      "Try being honest — the gap between where you are and where you want to be is exactly what we're here to close.",
    layout: 'list',
    type: 'multi',
    skip: false,
    options: [
      'Impulse buying',
      'Forgetting subscriptions',
      'Spending too much on food/eating out',
      'Not investing anything',
      'No budget or savings plan',
      'Comparing myself to others online',
      'Avoiding my bank account',
    ],
  },
  {
    key: 'downloadReason',
    title: 'Why did you download Stacked?',
    subtitle: "Your intentions matter to us — we want to help you WIN on your goals.",
    layout: 'list',
    type: 'single',
    skip: true,
    options: [
      'I feel stuck financially',
      'I want to stop living paycheck to paycheck',
      'I lost my drive to build wealth',
      'I want to find my financial purpose',
      'I want to stop wasting money',
      "I'm not sure but it looked interesting",
      'Other',
    ],
  },
];

export default function Questionnaire() {
  const router = useRouter();
  const answers = useOnboardingStore((s) => s.answers);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  const [stepIndex, setStepIndex] = useState(0);
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const advance = () => {
    if (isLastStep) {
      router.push('/onboarding/thankyou');
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      router.back();
    }
  };

  const handleSingleSelect = (option: string) => {
    setAnswer(step.key, option);
    advance();
  };

  const handleSkip = () => advance();

  const selectedHabits = (answers.moneyHabits ?? []) as string[];

  const handleToggleHabit = (option: string, idx: number) => {
    const isSelected = selectedHabits.includes(option);
    if (isSelected) {
      setAnswer('moneyHabits', selectedHabits.filter((o) => o !== option));
      return;
    }
    if (selectedHabits.length >= MAX_HABITS) {
      setShakeIndex(idx);
      setTimeout(() => setShakeIndex(null), 300);
      return;
    }
    setAnswer('moneyHabits', [...selectedHabits, option]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StepProgressBar step={stepIndex + 1} total={STEPS.length} />

      <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button">
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <ScreenEntrance key={stepIndex} style={styles.content}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.subtitle}</Text>

        {step.layout === 'grid' ? (
          <View style={styles.grid}>
            {step.options.map((option) => (
              <View key={option} style={styles.gridItem}>
                <AnswerButton
                  label={option}
                  variant="grid"
                  selected={answers[step.key] === option}
                  onPress={() => handleSingleSelect(option)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {step.options.map((option, idx) =>
              step.type === 'multi' ? (
                <CheckButton
                  key={option}
                  label={option}
                  checked={selectedHabits.includes(option)}
                  shake={shakeIndex === idx}
                  onPress={() => handleToggleHabit(option, idx)}
                />
              ) : (
                <AnswerButton
                  key={option}
                  label={option}
                  selected={answers[step.key] === option}
                  onPress={() => handleSingleSelect(option)}
                />
              ),
            )}
          </View>
        )}

        {step.type === 'multi' && selectedHabits.length > 0 && (
          <View style={styles.continueWrap}>
            <PrimaryButton label="Continue →" onPress={advance} />
          </View>
        )}

        {step.skip && (
          <Pressable onPress={handleSkip} style={styles.skip} accessibilityRole="button">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  backArrow: { color: colors.ash, fontSize: 22, fontFamily: fonts.bold },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ash,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  list: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  gridItem: { width: '47%' },
  continueWrap: { marginTop: spacing.xl },
  skip: { alignSelf: 'center', marginTop: spacing.xxl, padding: spacing.sm },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ash },
});
