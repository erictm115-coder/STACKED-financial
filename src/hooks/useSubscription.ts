import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';

import { ENTITLEMENT_ID, isPurchasesSupported } from '@/lib/purchases';

export type SubStatus = 'loading' | 'active' | 'inactive';

type UseSubscription = {
  status: SubStatus;
  isActive: boolean;
  recheck: () => Promise<void>;
};

/**
 * Source-of-truth subscription gate. RevenueCat is the only authority — there is
 * no Supabase subscription table. Entitlement id comes from the shared constant
 * in `@/lib/purchases` (currently `'Stacked Pro'`).
 */
export function useSubscription(): UseSubscription {
  const [status, setStatus] = useState<SubStatus>('loading');

  const check = useCallback(async (): Promise<void> => {
    // DEV BYPASS — remove before App Store submission.
    if (__DEV__) {
      setStatus('active');
      return;
    }

    // Android is a no-op until Android subscriptions are configured.
    if (Platform.OS !== 'ios') {
      setStatus('active');
      return;
    }

    // Expo Go / unsupported runtime: don't hard-lock the user out.
    if (!isPurchasesSupported()) {
      setStatus('active');
      return;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setStatus(isActive ? 'active' : 'inactive');
    } catch (err) {
      // Fail open: a network error must NOT lock out a paying user.
      console.warn('[useSubscription] Check failed — failing open:', err);
      setStatus('active');
    }
  }, []);

  useEffect(() => {
    check();

    // Real-time entitlement changes while the app is open (purchase completes,
    // subscription expires mid-session, etc.).
    if (__DEV__ || Platform.OS !== 'ios' || !isPurchasesSupported()) {
      return;
    }

    const listener = (info: CustomerInfo) => {
      const isActive = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setStatus(isActive ? 'active' : 'inactive');
    };

    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [check]);

  return { status, isActive: status === 'active', recheck: check };
}
