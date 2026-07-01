import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/store/onboardingStore';

const AnimatedImage = Animated.createAnimatedComponent(Image);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = EMAIL_RE.test(email.trim());

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setError(null);
    setSubmitting(true);

    const trimmedEmail = email.trim();
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: trimmedEmail });

    if (otpError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setAnswer('email', trimmedEmail);

    setSubmitting(false);
    router.push('/onboarding/verify');
  };

  // Smoothly shrink/fade the hero image when the input gets focused to leave
  // maximum space for the keyboard.
  const heroProgress = useSharedValue(1);
  useEffect(() => {
    heroProgress.value = withTiming(focused ? 0 : 1, { duration: 200 });
  }, [focused, heroProgress]);

  const heroImageAnimatedStyle = useAnimatedStyle(() => ({
    height: heroProgress.value * 240,
    opacity: heroProgress.value,
    marginBottom: heroProgress.value * spacing.md,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.flex}>
          <ScreenEntrance style={[styles.content, { paddingTop: height * 0.095 }]}>
            <AnimatedImage
              source={require('../../../assets/images/hero.png')}
              style={[styles.heroImage, heroImageAnimatedStyle]}
              contentFit="contain"
            />
            <Text style={styles.title}>Let&apos;s get started</Text>
            <Text style={styles.subtitle}>
              Enter your email to unlock your personalised wealth plan.
            </Text>

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

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.cta}>
              <PrimaryButton
                label={submitting ? 'Sending…' : 'Get My Free Plan →'}
                onPress={handleSubmit}
                disabled={!isValid || submitting}
              />
            </View>

            <Text style={styles.privacy}>We respect your privacy. No spam, ever.</Text>
          </ScreenEntrance>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  heroImage: { width: '100%', height: 240, alignSelf: 'center' },
  content: { paddingHorizontal: spacing.xl, gap: spacing.md },
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
  error: { fontFamily: fonts.medium, fontSize: 13, color: '#ff4b4b' },
  cta: { marginTop: spacing.md },
  privacy: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
