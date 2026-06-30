import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, Circle, CheckCircle2 } from 'lucide-react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  getSubscriptionOfferings,
  purchaseSubscriptionPackage,
  restoreSubscriptionPurchases,
  isPurchasesSupported,
} from '@/lib/purchases';



type Plan = {
  id: string;
  pkg: PurchasesPackage | null;
  label: string;
  price: string;
  period: string;
  subLabel: string | null;
  badge: string | null;
};

const FEATURES = [
  'Unlimited financial goal plans',
  'Actionable, step by step lessons for any money goal',
];

function PlanCard({ plan, selected, onPress }: { plan: Plan; selected: boolean; onPress: () => void }) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 150 });
  }, [selected, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [colors.graphite, colors.brandGreen]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, '#0a2200']),
  }));

  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      <Animated.View style={[styles.planCard, cardStyle]}>
        {plan.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}
        {selected ? (
          <CheckCircle2 size={20} color={colors.brandGreen} />
        ) : (
          <Circle size={20} color={colors.graphite} />
        )}
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.label}</Text>
          <Text style={styles.planPrice}>{plan.price} {plan.period}</Text>
          {plan.subLabel && <Text style={styles.planSub}>{plan.subLabel}</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function Paywall() {
  const { completeOnboarding } = useOnboarding();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Hard paywall: block the Android hardware back button while this screen is
  // focused. No-op on iOS, but future-proofs the Android path.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  // Load current offerings on mount
  useEffect(() => {
    let isMounted = true;

    getSubscriptionOfferings()
      .then((offering) => {
        if (!isMounted) return;
        if (offering && offering.availablePackages.length > 0) {
          setPackages(offering.availablePackages);
          // Auto select ANNUAL or WEEKLY
          const annual = offering.availablePackages.find((p) => p.packageType === 'ANNUAL');
          const weekly = offering.availablePackages.find((p) => p.packageType === 'WEEKLY');
          setSelectedPackage(annual || weekly || offering.availablePackages[0]);
        }
      })
      .catch((err) => {
        console.warn('[RevenueCat] Failed to fetch offerings:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePurchase = async () => {
    if (isLoading) return;
    if (!selectedPackage) {
      setPurchaseError('Subscription options are still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setPurchaseError(null);
    try {
      const success = await purchaseSubscriptionPackage(selectedPackage);
      if (success) {
        // Purchase success is the only exit from the hard paywall.
        completeOnboarding();
      }
      // success === false → user cancelled the payment sheet, or the purchase did
      // not activate the entitlement. Either way, stay on the paywall silently —
      // a cancel is not an error, and there is no escape hatch.
    } catch (err: any) {
      setPurchaseError('Purchase failed. Please try again or contact support.');
      console.warn('[Purchase] Error:', err?.message, err?.code);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setPurchaseError(null);
    try {
      const success = await restoreSubscriptionPurchases();
      if (success) {
        // Restore success is the only other exit from the hard paywall.
        completeOnboarding();
      } else {
        setPurchaseError('No active subscription found to restore.');
      }
    } catch {
      setPurchaseError('Restore failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Paywall UI
  // Map fetched packages to our visual schema, or render placeholders if empty
  const plansToRender: Plan[] = packages.length > 0
    ? packages.map((pkg) => {
        const isAnnual = pkg.packageType === 'ANNUAL';
        return {
          id: pkg.identifier,
          pkg,
          label: isAnnual ? 'Annual' : pkg.packageType === 'WEEKLY' ? 'Weekly' : pkg.product.title,
          price: pkg.product.priceString,
          period: isAnnual ? 'per year' : pkg.packageType === 'WEEKLY' ? 'per week' : '',
          subLabel: isAnnual ? '1 week free, then less than €0.80/week' : null,
          badge: isAnnual ? 'BEST VALUE' : null,
        };
      })
    : [
        {
          id: 'weekly',
          pkg: null,
          label: 'Weekly',
          price: '€3.99',
          period: 'per week',
          subLabel: null,
          badge: null,
        },
        {
          id: 'annual',
          pkg: null,
          label: 'Annual',
          price: '€39.99',
          period: 'per year',
          subLabel: '1 week free, then €0.76/week',
          badge: 'BEST VALUE',
        },
      ];

  const selectedPlanId = selectedPackage ? selectedPackage.identifier : (packages.length > 0 ? '' : 'annual');

  return (
    <SafeAreaView style={styles.safe}>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.brandGreen} />
        </View>
      )}

      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>
          Do <Text style={{ color: colors.brandGreen, fontStyle: 'italic' }}>more</Text> of what builds your{' '}
          <Text style={{ color: colors.brandGreen }}>wealth</Text> and stress{' '}
          <Text style={{ fontStyle: 'italic' }}>less</Text>
        </Text>
        <Text style={styles.subtitle}>
          Reclaim your focus, your money, and your future today with our premium plan.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <CheckCircle size={18} color={colors.brandGreen} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {plansToRender.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={plan.id === selectedPlanId || (packages.length === 0 && plan.id === 'annual')}
              onPress={() => {
                if (plan.pkg) {
                  setSelectedPackage(plan.pkg);
                  setPurchaseError(null);
                }
              }}
            />
          ))}
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Continue" onPress={handlePurchase} disabled={isLoading} />
          {purchaseError && <Text style={styles.errorText}>{purchaseError}</Text>}
        </View>
      </ScreenEntrance>

      <View style={styles.footer}>
        <Pressable onPress={handleRestore}>
          <Text style={styles.footerText}>Restore</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable onPress={() => Alert.alert('Terms of Service', 'Standard Apple/Google terms apply.')}>
          <Text style={styles.footerText}>Terms</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable onPress={() => Alert.alert('Privacy Policy', 'Your data is safe and encrypted.')}>
          <Text style={styles.footerText}>Privacy</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.7)',
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 75 },
  title: { fontFamily: fonts.extraBold, fontSize: 32, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  features: { gap: 8, marginTop: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  plans: { gap: 12, marginTop: 20 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 2,
    position: 'relative',
  },
  planInfo: { flex: 1 },
  planName: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  planSub: { fontFamily: fonts.bold, fontSize: 12, color: colors.brandGreen, marginTop: 4 },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.brandGreen,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: '#ffffff' },
  cta: { marginTop: 32 },
  errorText: {
    color: '#ff4b4b',
    fontSize: 13,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: 24,
  },
  footerText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.ash },
  footerDot: { color: colors.ash },
});
