import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

type PlanId = 'weekly' | 'monthly' | 'annual';

const PLANS: { id: PlanId; name: string; price: string; badge?: string; sub?: string }[] = [
  { id: 'weekly', name: 'Weekly', price: '€1.99 / week' },
  { id: 'monthly', name: 'Monthly', price: '€3.09 / month', badge: '14% OFF' },
  {
    id: 'annual',
    name: 'Annual',
    price: '€34.99 / yr',
    badge: '60% OFF',
    sub: '1 week free, cancel anytime',
  },
];

const FEATURES = [
  'Unlimited financial goal plans',
  'Actionable step-by-step lessons for any money goal',
];

/** Placeholder purchase flow — wire up to RevenueCat/StoreKit when ready. */
function startPurchase(planId: PlanId) {
  console.log('[paywall] purchase initiated for plan:', planId);
}

export default function Paywall() {
  const { completeOnboarding } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');

  const handleClose = () => completeOnboarding();

  const handleContinue = () => {
    startPurchase(selectedPlan);
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable onPress={handleClose} style={styles.closeButton} accessibilityRole="button">
        <Text style={styles.closeIcon}>✕</Text>
      </Pressable>

      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>Do more of what builds your wealth — and stress less</Text>
        <Text style={styles.subtitle}>
          Reclaim your focus, your money, and your future today with our premium plan.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => {
            const selected = plan.id === selectedPlan;
            return (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[styles.planCard, selected && styles.planCardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>
                    {plan.name} <Text style={styles.planPrice}>{plan.price}</Text>
                  </Text>
                  {plan.sub && <Text style={styles.planSub}>{plan.sub}</Text>}
                </View>
                {plan.badge && (
                  <View style={[styles.badge, plan.id === 'annual' && styles.badgeFilled]}>
                    <Text style={[styles.badgeText, plan.id === 'annual' && styles.badgeTextFilled]}>
                      {plan.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Continue for free →" onPress={handleContinue} />
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => console.log('[paywall] restore tapped')}>
            <Text style={styles.footerText}>Restore</Text>
          </Pressable>
          <Text style={styles.footerDot}>·</Text>
          <Pressable onPress={() => console.log('[paywall] terms tapped')}>
            <Text style={styles.footerText}>Terms and conditions</Text>
          </Pressable>
          <Text style={styles.footerDot}>·</Text>
          <Pressable onPress={() => console.log('[paywall] privacy tapped')}>
            <Text style={styles.footerText}>Privacy policy</Text>
          </Pressable>
        </View>
      </ScreenEntrance>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeIcon: { color: colors.ash, fontSize: 20 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  title: { fontFamily: fonts.extraBold, fontSize: 26, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  features: { gap: spacing.sm, marginBottom: spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkmark: { color: colors.brandGreen, fontSize: 16, fontFamily: fonts.bold },
  featureText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  plans: { gap: spacing.md },
  planCard: {
    height: 64,
    borderRadius: radius.input,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.graphite,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planCardSelected: { borderColor: colors.brandGreen, backgroundColor: '#0a2200' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.graphite,
  },
  radioSelected: { borderColor: colors.brandGreen, backgroundColor: colors.brandGreen },
  planInfo: { flex: 1 },
  planName: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.medium, color: colors.textSecondary },
  planSub: { fontFamily: fonts.medium, fontSize: 12, color: colors.ash, marginTop: 2 },
  badge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeFilled: { backgroundColor: colors.brandGreen },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.brandGreen },
  badgeTextFilled: { color: colors.background },
  cta: { marginTop: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  footerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  footerDot: { color: colors.textMuted, fontSize: 13 },
});
