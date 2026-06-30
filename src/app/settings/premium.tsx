import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator, Alert, NativeModules, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import RevenueCatUI from 'react-native-purchases-ui';

import { colors, fonts, spacing } from '@/constants/theme';
import { useEntitlementStatus, isPurchasesSupported } from '@/lib/purchases';
import Paywall from '../onboarding/paywall';

const isNativePaywallSupported = () => {
  return (
    isPurchasesSupported() &&
    NativeModules.RNPaywalls !== undefined &&
    UIManager.getViewManagerConfig('Paywall') != null
  );
};

export default function Premium() {
  const router = useRouter();
  const { hasPro, loading } = useEntitlementStatus();

  // Custom paywall fallback state in case native Paywall doesn't load/exist
  const [showCustomFallback, setShowCustomFallback] = useState(!isNativePaywallSupported());

  const handleDismiss = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleDismiss} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Stacked Pro</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandGreen} />
        </View>
      </SafeAreaView>
    );
  }

  // 1. If user has active Stacked Pro entitlement, render the RevenueCat Customer Center
  if (hasPro) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleDismiss} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Manage Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <RevenueCatUI.CustomerCenterView
          style={styles.customerCenter}
          onDismiss={handleDismiss}
          onRestoreCompleted={() => {
            Alert.alert('Restore Complete', 'Purchases restored successfully.');
          }}
        />
      </SafeAreaView>
    );
  }

  // 2. If user is NOT subscribed and fallback is triggered, render custom fallback Paywall
  if (showCustomFallback) {
    return (
      <View style={{ flex: 1 }}>
        <Paywall />
      </View>
    );
  }

  // 3. Render RevenueCat Dashboard configured Paywall
  return (
    <RevenueCatUI.Paywall
      onPurchaseCompleted={handleDismiss}
      onDismiss={handleDismiss}
      onPurchaseError={(error) => {
        console.error('[Settings Paywall] Purchase error:', error);
        if ((error.error?.code as any) === 2) {
          // Fallback to custom UI on configuration issues
          setShowCustomFallback(true);
        } else {
          Alert.alert('Purchase Failed', error.error?.message || 'Could not complete purchase.');
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.graphite,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerCenter: {
    flex: 1,
  },
});
