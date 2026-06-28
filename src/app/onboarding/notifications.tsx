import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Check, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, spacing } from '@/constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();

  const handleEnable = async () => {
    try {
      await Notifications.requestPermissionsAsync();
    } finally {
      router.push('/onboarding/paywall');
    }
  };

  const handleSkip = () => router.push('/onboarding/paywall');

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenEntrance style={styles.content}>
        <View style={styles.bellWrap}>
          <Image 
            source={require('@/assets/images/notification.webp')} 
            style={{ width: 115, height: 115 }} 
            contentFit="contain"
            transition={0}
            priority="high"
          />
        </View>

        <Text style={styles.title}>Want to actually hit your financial goals?</Text>
        <Text style={styles.body}>
          We&apos;ll send you daily nudges to keep you on track — because consistency is the only
          thing standing between you and financial freedom.
        </Text>

        <View style={styles.cta}>
          <PrimaryButton
            label="Enable notifications"
            icon={<Check size={18} color={colors.background} />}
            onPress={handleEnable}
          />
        </View>

        <Pressable onPress={handleSkip} style={styles.skip} accessibilityRole="button">
          <X size={16} color={colors.ash} />
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
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
    gap: spacing.md,
  },
  bellWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  cta: { width: '100%', marginTop: spacing.md },
  skip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  skipText: { fontFamily: fonts.medium, fontSize: 14, color: colors.ash },
});
