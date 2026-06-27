import { CheckCircle, Circle, CheckCircle2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ScreenEntrance } from '@/components/ui/ScreenEntrance';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useOnboarding } from '@/hooks/useOnboarding';

type PlanId = 'weekly' | 'annual';

type Plan = {
  id: PlanId;
  label: string;
  price: string;
  period: string;
  subLabel: string | null;
  badge: string | null;
};

const PLANS: Plan[] = [
  {
    id: 'annual',
    label: 'Annual',
    price: '€39.99',
    period: 'per year',
    subLabel: '€3.33/month · billed yearly',
    badge: 'BEST VALUE',
  },
  { id: 'weekly', label: 'Weekly', price: '€3.99', period: 'per week', subLabel: null, badge: null },
];

const FEATURES = [
  'Unlimited financial goal plans',
  'Actionable step-by-step lessons for any money goal',
];

/** Placeholder purchase flow — wire up to RevenueCat/StoreKit when ready. */
function startPurchase(planId: PlanId) {
  console.log('[paywall] purchase initiated for plan:', planId);
}

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
          <Text style={styles.planName}>
            {plan.label} <Text style={styles.planPrice}>{plan.price} {plan.period}</Text>
          </Text>
          {plan.subLabel && <Text style={styles.planSub}>{plan.subLabel}</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
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
        <X size={20} color={colors.ash} />
      </Pressable>

      <ScreenEntrance style={styles.content}>
        <Text style={styles.title}>Do more of what builds your wealth — and stress less</Text>
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
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={plan.id === selectedPlan}
              onPress={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Continue" onPress={handleContinue} />
        </View>
      </ScreenEntrance>

      <View style={styles.footer}>
        <Pressable onPress={() => console.log('[paywall] restore tapped')}>
          <Text style={styles.footerText}>Restore</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable onPress={() => console.log('[paywall] terms tapped')}>
          <Text style={styles.footerText}>Terms</Text>
        </Pressable>
        <Text style={styles.footerDot}>·</Text>
        <Pressable onPress={() => console.log('[paywall] privacy tapped')}>
          <Text style={styles.footerText}>Privacy</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: spacing.xl,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 64 },
  title: { fontFamily: fonts.extraBold, fontSize: 24, color: colors.textPrimary },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  features: { gap: spacing.sm, marginTop: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureText: { flex: 1, fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  plans: { gap: spacing.md, marginTop: spacing.xl },
  planCard: {
    height: 64,
    borderRadius: radius.input,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: colors.brandGreen,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontFamily: fonts.extraBold, fontSize: 11, color: colors.background },
  planInfo: { flex: 1 },
  planName: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  planPrice: { fontFamily: fonts.medium, color: colors.textSecondary },
  planSub: { fontFamily: fonts.medium, fontSize: 12, color: colors.ash, marginTop: 2 },
  cta: { marginTop: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  footerText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMuted },
  footerDot: { color: colors.textMuted, fontSize: 13 },
});
