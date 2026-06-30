import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform, NativeModules } from 'react-native';
import { useState, useEffect } from 'react';

const REVENUECAT_API_KEY = 'appl_iGFhzEJsGBrvabbQBmEStFjduNq';
export const ENTITLEMENT_ID = 'Stacked Pro';

export const isPurchasesSupported = () => {
  return (
    (Platform.OS === 'ios' || Platform.OS === 'android') &&
    NativeModules.RNPurchases !== undefined &&
    Purchases !== null &&
    Purchases !== undefined
  );
};

export async function configurePurchases(userId?: string): Promise<void> {
  try {
    if (isPurchasesSupported()) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: userId || null,
      });
      console.log('[RevenueCat] SDK configured successfully');
    } else {
      console.log('[RevenueCat] SDK configuration skipped (Unsupported platform or Expo Go)');
    }
  } catch (err) {
    console.warn('[RevenueCat] Initialization failed:', err);
  }
}

export async function identifyUser(userId: string): Promise<CustomerInfo | null> {
  try {
    if (!isPurchasesSupported()) return null;
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('[RevenueCat] User identified:', userId);
    return customerInfo;
  } catch (err) {
    console.warn('[RevenueCat] logIn failed:', err);
    return null;
  }
}

export async function logoutUser(): Promise<CustomerInfo | null> {
  try {
    if (!isPurchasesSupported()) return null;
    const customerInfo = await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
    return customerInfo;
  } catch (err) {
    console.warn('[RevenueCat] logOut failed:', err);
    return null;
  }
}

export async function checkStackedProEntitlement(): Promise<boolean> {
  try {
    if (!isPurchasesSupported()) return false;
    const customerInfo = await Purchases.getCustomerInfo();
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    console.log('[RevenueCat] Entitlement check (Stacked Pro):', isActive);
    return isActive;
  } catch (err) {
    console.warn('[RevenueCat] getCustomerInfo failed:', err);
    return false;
  }
}

export async function getSubscriptionOfferings(): Promise<PurchasesOffering | null> {
  try {
    if (!isPurchasesSupported()) return null;
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null) {
      console.log('[RevenueCat] Offerings fetched successfully');
      return offerings.current;
    }
    return null;
  } catch (err) {
    console.warn('[RevenueCat] getOfferings failed (this is expected if products are not configured in your dashboard yet):', err);
    return null;
  }
}

export async function purchaseSubscriptionPackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    if (!isPurchasesSupported()) return false;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    console.log('[RevenueCat] Purchase complete. Entitlement status:', isActive);
    return isActive;
  } catch (err: any) {
    if (err.userCancelled) {
      console.log('[RevenueCat] User cancelled purchase process');
      return false;
    }
    console.warn('[RevenueCat] Purchase failed:', err);
    return false;
  }
}

export async function restoreSubscriptionPurchases(): Promise<boolean> {
  try {
    if (!isPurchasesSupported()) return false;
    const customerInfo = await Purchases.restorePurchases();
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    console.log('[RevenueCat] Restore complete. Entitlement status:', isActive);
    return isActive;
  } catch (err) {
    console.warn('[RevenueCat] Restore failed:', err);
    return false;
  }
}

export function useEntitlementStatus() {
  const [hasPro, setHasPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    if (!isPurchasesSupported()) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      const active = await checkStackedProEntitlement();
      if (isMounted) {
        setHasPro(active);
        setLoading(false);
      }
    };

    checkStatus();

    const customerInfoListener = (info: CustomerInfo) => {
      const active = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      if (isMounted) {
        setHasPro(active);
      }
    };

    // Listen to changes in customer info
    Purchases.addCustomerInfoUpdateListener(customerInfoListener);

    return () => {
      isMounted = false;
      Purchases.removeCustomerInfoUpdateListener(customerInfoListener);
    };
  }, []);

  return { hasPro, loading };
}
