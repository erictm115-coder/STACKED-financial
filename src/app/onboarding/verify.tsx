import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { calculateScores } from '@/lib/calculateScores';
import { supabase } from '@/lib/supabase';
import { useOnboardingData } from '@/hooks/useOnboardingData';
import { useOnboardingStore } from '@/store/onboardingStore';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const SMALL_SCREEN_WIDTH = 380;

export default function Verify() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { saveAnswers, saveScores } = useOnboardingData();
  const answers = useOnboardingStore((s) => s.answers);
  const setScores = useOnboardingStore((s) => s.setScores);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);
  const submitted = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => inputs.current[0]?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async (code: string) => {
    if (!answers.email) {
      setError('Missing email — please go back and try again.');
      submitted.current = false;
      return;
    }

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: answers.email,
      token: code,
      type: 'email',
    });

    if (verifyError || !data.user) {
      setError('That code didn\'t work. Please try again.');
      submitted.current = false;
      setDigits(Array(CODE_LENGTH).fill(''));
      inputs.current[0]?.focus();
      return;
    }

    const userId = data.user.id;

    await supabase.from('profiles').upsert({ id: userId, email: answers.email });
    await saveAnswers(userId, answers);

    const scores = calculateScores(answers);
    setScores(scores);
    await saveScores(userId, scores);

    router.push('/onboarding/results');
  };

  const submitIfComplete = (code: string[]) => {
    if (code.every((d) => d !== '') && !submitted.current) {
      submitted.current = true;
      setError(null);
      handleVerify(code.join(''));
    }
  };

  const handleChange = (text: string, index: number) => {
    const pasted = text.replace(/[^0-9]/g, '');

    if (pasted.length > 1) {
      // Paste: distribute digits across this box and the following ones.
      const next = [...digits];
      let cursor = index;
      for (const char of pasted) {
        if (cursor >= CODE_LENGTH) break;
        next[cursor] = char;
        cursor += 1;
      }
      setDigits(next);
      const focusTarget = Math.min(cursor, CODE_LENGTH - 1);
      inputs.current[focusTarget]?.focus();
      submitIfComplete(next);
      return;
    }

    const value = pasted.slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    submitIfComplete(next);
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || !answers.email) return;
    setSecondsLeft(RESEND_SECONDS);
    await supabase.auth.signInWithOtp({ email: answers.email });
  };

  const isSmallScreen = width < SMALL_SCREEN_WIDTH;
  const boxWidth = isSmallScreen ? 44 : 52;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 80}
      >
        <ScreenEntrance style={styles.content}>
          <Text style={styles.title}>Enter your code</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to your email</Text>

          <View style={styles.boxRow}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                onFocus={() => setFocusedIndex(index)}
                keyboardType="number-pad"
                maxLength={6}
                style={[
                  styles.box,
                  { width: boxWidth },
                  focusedIndex === index && styles.boxActive,
                ]}
              />
            ))}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={handleResend} disabled={secondsLeft > 0} accessibilityRole="button">
            <Text style={styles.resend}>
              {secondsLeft > 0 ? `Resend available in ${secondsLeft}s` : "Didn't get it? Resend"}
            </Text>
          </Pressable>
        </ScreenEntrance>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, flex: 1 },
  title: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.ash, textAlign: 'center' },
  boxRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md, marginBottom: 40 },
  box: {
    height: 62,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.graphite,
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: 'center',
  },
  boxActive: { borderColor: colors.brandGreen },
  error: { fontFamily: fonts.medium, fontSize: 13, color: '#ff4b4b', textAlign: 'center' },
  resend: { fontFamily: fonts.medium, fontSize: 14, color: colors.accentBlue },
});
