import { useRouter } from 'expo-router';
import { Target } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, spacing } from '@/constants/theme';

export default function ThankYou() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.content}>
        <Target size={72} color={colors.brandGreen} />
        <Text style={styles.title}>Thank you for your honesty, friend.</Text>
        <Text style={styles.body}>Now we have something powerful for you :)</Text>

        <View style={styles.cta}>
          <PrimaryButton
            label="Tap here to continue →"
            onPress={() => router.push('/onboarding/loading')}
          />
        </View>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cta: { width: '100%', marginTop: spacing.xl },
});
