import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function Verify() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);
  const submitted = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleChange = (text: string, index: number) => {
    const value = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (value && index === CODE_LENGTH - 1 && next.every((d) => d !== '') && !submitted.current) {
      submitted.current = true;
      router.push('/onboarding/paywall');
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <SafeAreaView style={styles.safe}>
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
              maxLength={1}
              autoFocus={index === 0}
              style={[styles.box, focusedIndex === index && styles.boxActive]}
            />
          ))}
        </View>

        <Pressable onPress={handleResend} disabled={secondsLeft > 0} accessibilityRole="button">
          <Text style={styles.resend}>
            {secondsLeft > 0 ? `Resend available in ${secondsLeft}s` : "Didn't get it? Resend"}
          </Text>
        </Pressable>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  title: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.ash, textAlign: 'center' },
  boxRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  box: {
    width: 44,
    height: 54,
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
  resend: { fontFamily: fonts.medium, fontSize: 14, color: colors.accentBlue, marginTop: spacing.md },
});
