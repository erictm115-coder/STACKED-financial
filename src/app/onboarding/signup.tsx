import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PulsingBlob } from '@/components/ui/PulsingBlob';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const isValid = EMAIL_RE.test(email.trim());

  const handleSubmit = () => {
    if (!isValid) return;
    setAnswer('email', email.trim());
    router.push('/onboarding/results');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.blobArea}>
        <PulsingBlob />
      </View>

      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>Let&apos;s get started</Text>
        <Text style={styles.subtitle}>Enter your email to unlock your personalised wealth plan.</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="your@email.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.input, focused && styles.inputFocused]}
        />

        <View style={styles.cta}>
          <PrimaryButton label="Get My Free Plan →" onPress={handleSubmit} disabled={!isValid} />
        </View>

        <Text style={styles.privacy}>We respect your privacy. No spam, ever.</Text>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  blobArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { fontFamily: fonts.extraBold, fontSize: 28, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.medium, fontSize: 15, color: colors.textSecondary, marginBottom: spacing.sm },
  input: {
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
  inputFocused: { borderColor: colors.brandGreen },
  cta: { marginTop: spacing.md },
  privacy: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
