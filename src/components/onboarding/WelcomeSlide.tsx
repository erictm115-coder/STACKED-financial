import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, fonts, radius, spacing, typography } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import { supabase } from '@/lib/supabase';

type Props = { index: number; activeIndex: number };
type Mode = 'welcome' | 'email' | 'otp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;

export function WelcomeSlide({ index, activeIndex }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const active = index === activeIndex;

  const [mode, setMode] = useState<Mode>('welcome');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = active
      ? withDelay(80, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }))
      : 0;
  }, [active, enter]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: (1 - enter.value) * 20 }],
  }));

  const handleSendCode = async () => {
    if (submitting) return;
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: trimmedEmail });
    setSubmitting(false);
    if (otpError) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setMode('otp');
  };

  const handleVerifyCode = async () => {
    if (submitting) return;
    if (code.length !== CODE_LENGTH) {
      setError('Enter the 6-digit code.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'email',
    });
    setSubmitting(false);
    if (verifyError || !data.user) {
      setError("That code didn't work. Please try again.");
      return;
    }
    completeOnboarding();
  };

  const handleBack = () => {
    setError(null);
    setCode('');
    setMode(mode === 'otp' ? 'email' : 'welcome');
  };

  const primaryLabel =
    mode === 'welcome' ? 'GET STARTED →' : mode === 'email' ? 'Send Code' : 'Verify';
  const primaryDisabled =
    submitting || (mode === 'email' && email.trim().length === 0) || (mode === 'otp' && code.length !== CODE_LENGTH);
  const handlePrimary =
    mode === 'welcome'
      ? () => router.push('/onboarding/questionnaire')
      : mode === 'email'
        ? handleSendCode
        : handleVerifyCode;

  return (
    <View style={[styles.page, { width }]}>
      <Animated.View style={[styles.content, contentStyle]}>
        {mode === 'welcome' && (
          <>
            <Image
              source={require('@/assets/images/welcome-illustration.png')}
              style={styles.art}
              contentFit="contain"
            />
            <Text style={styles.headline}>Welcome to Stacked</Text>
            <Text style={styles.sub}>Starting today, let&apos;s build wealth on your terms.</Text>
          </>
        )}

        {mode === 'email' && (
          <>
            <Text style={styles.headline}>Welcome back</Text>
            <Text style={styles.sub}>Enter your email and we&apos;ll send you a sign in code.</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              style={styles.input}
            />
          </>
        )}

        {mode === 'otp' && (
          <>
            <Text style={styles.headline}>Enter your code</Text>
            <Text style={styles.sub}>We sent a 6-digit code to {email.trim()}</Text>
            <TextInput
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              autoFocus
              style={[styles.input, styles.codeInput]}
            />
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </Animated.View>

      <View style={styles.cta}>
        <PrimaryButton label={primaryLabel} onPress={handlePrimary} disabled={primaryDisabled} />
      </View>

      <Pressable
        onPress={mode === 'welcome' ? () => setMode('email') : handleBack}
        style={styles.secondaryLink}
        accessibilityRole="button"
      >
        {({ pressed }) => (
          <Text style={[styles.secondaryLinkText, pressed && styles.secondaryLinkTextPressed]}>
            {mode === 'welcome' ? 'Already have an account?' : 'Back'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  content: { alignItems: 'center', gap: 20, marginTop: -70 },
  art: { width: 300, aspectRatio: 960 / 1080, marginBottom: 8 },
  headline: { ...typography.heading, color: colors.textPrimary, textAlign: 'center' },
  sub: { ...typography.bodyLg, color: colors.textSecondary, textAlign: 'center', marginTop: -8 },
  input: {
    width: '100%',
    height: 54,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.graphite,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  codeInput: { textAlign: 'center', fontFamily: fonts.bold, fontSize: 20, letterSpacing: 4 },
  error: { fontFamily: fonts.medium, fontSize: 13, color: '#ff4b4b', textAlign: 'center' },
  cta: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 140 },
  secondaryLink: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 106, alignItems: 'center' },
  secondaryLinkText: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.textPrimary },
  secondaryLinkTextPressed: { opacity: 0.5 },
});
