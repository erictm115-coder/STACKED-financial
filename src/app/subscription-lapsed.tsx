import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { colors, fonts, spacing } from '@/constants/theme';
import { restoreSubscriptionPurchases } from '@/lib/purchases';

export default function SubscriptionLapsed() {
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestore = async (): Promise<void> => {
    if (isRestoring) return;
    setIsRestoring(true);
    setError(null);
    try {
      const success = await restoreSubscriptionPurchases();
      if (success) {
        router.replace('/discover');
      } else {
        setError('No active subscription found.');
      }
    } catch {
      setError('Restore failed. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('@/assets/images/appicon.png')}
        style={styles.icon}
        contentFit="contain"
      />
      <Text style={styles.headline}>Your subscription has ended</Text>
      <Text style={styles.body}>Renew to keep stacking and access all your plans.</Text>

      <View style={styles.cta}>
        <PrimaryButton label="Renew Subscription →" onPress={() => router.push('/onboarding/paywall')} />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.restore} onPress={handleRestore}>
        {isRestoring ? 'Restoring…' : 'Restore purchases'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: { width: 72, height: 72, borderRadius: 16, marginBottom: spacing.xxl },
  headline: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  cta: { width: '100%' },
  error: {
    color: '#ff4b4b',
    fontSize: 13,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  restore: { color: colors.ash, fontSize: 14, fontFamily: fonts.medium, marginTop: spacing.lg },
});
