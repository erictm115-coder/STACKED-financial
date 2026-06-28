import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
  /** Override for titles that would otherwise wrap onto 3 lines (default 28). */
  titleFontSize?: number;
  subtitleFontSize?: number;
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
    title: 'Pick your two biggest\nmoney habits right now',
    subtitle:
      "Try being honest — the gap between where you are and where you want to be is exactly what we're here to close.",
    layout: 'list',
    type: 'multi',
    skip: false,
    titleFontSize: 20,
    subtitleFontSize: 13,
    options: [
      'Impulse buying',
      'Spending too much on food/eating out',
      'Not investing anything',
      'No budget or savings plan',
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

/** Top-anchored toast — fades in, holds, fades out. Used for the max-selection notice. */
function MaxSelectionToast({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.toast, style]} pointerEvents="none">
      <Text style={styles.toastText}>You can only pick 2</Text>
    </Animated.View>
  );
}

export default function Questionnaire() {
  const router = useRouter();
  const answers = useOnboardingStore((s) => s.answers);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  const [stepIndex, setStepIndex] = useState(0);
  const [showMaxToast, setShowMaxToast] = useState(false);

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

  const handleToggleHabit = (option: string) => {
    const isSelected = selectedHabits.includes(option);
    if (isSelected) {
      setAnswer('moneyHabits', selectedHabits.filter((o) => o !== option));
      return;
    }
    if (selectedHabits.length >= MAX_HABITS) {
      setShowMaxToast(true);
      setTimeout(() => setShowMaxToast(false), 2000);
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

      <MaxSelectionToast visible={showMaxToast} />

      <ScreenEntrance key={stepIndex} style={styles.content}>
        <View>
          <Text
            style={[
              styles.title,
              step.titleFontSize ? { fontSize: step.titleFontSize } : null,
            ]}
          >
            {step.title}
          </Text>
          <Text style={[styles.subtitle, step.subtitleFontSize ? { fontSize: step.subtitleFontSize } : null]}>
            {step.subtitle}
          </Text>
        </View>

        <View style={styles.answersArea}>
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
              {step.options.map((option) =>
                step.type === 'multi' ? (
                  <CheckButton
                    key={option}
                    label={option}
                    checked={selectedHabits.includes(option)}
                    onPress={() => handleToggleHabit(option)}
                    style={step.key === 'moneyHabits' ? styles.habitButton : styles.flexButton}
                  />
                ) : (
                  <AnswerButton
                    key={option}
                    label={option}
                    selected={answers[step.key] === option}
                    onPress={() => handleSingleSelect(option)}
                    style={styles.flexButton}
                  />
                ),
              )}
            </View>
          )}
        </View>

        {step.type === 'multi' && selectedHabits.length > 0 && (
          <View style={[styles.continueWrap, step.key === 'moneyHabits' && styles.continueHabits]}>
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
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ash,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  answersArea: { flex: 1, justifyContent: 'center' },
  list: { flex: 1, justifyContent: 'center', gap: 8 },
  flexButton: {
    flex: 1,
    minHeight: 42,
    maxHeight: 54,
  },
  habitButton: {
    height: 48,
    minHeight: 48,
    maxHeight: 48,
  },
  continueHabits: {
    position: 'absolute',
    bottom: 34,
    left: 24,
    right: 24,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  gridItem: { width: '47%' },
  continueWrap: { paddingTop: spacing.sm },
  skip: { alignSelf: 'center', padding: spacing.sm },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ash },
  toast: {
    position: 'absolute',
    top: 56,
    left: spacing.xl,
    right: spacing.xl,
    zIndex: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#ff4b4b',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
});
