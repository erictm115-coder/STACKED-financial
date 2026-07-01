import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useSubscription } from './useSubscription';
import { isPurchasesSupported, ENTITLEMENT_ID } from '@/lib/purchases';
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('react-native-purchases', () => ({
  getCustomerInfo: jest.fn(),
  addCustomerInfoUpdateListener: jest.fn(),
  removeCustomerInfoUpdateListener: jest.fn(),
}));

jest.mock('@/lib/purchases', () => ({
  isPurchasesSupported: jest.fn(),
  ENTITLEMENT_ID: 'Stacked Pro',
}));

const setPlatform = (os: 'ios' | 'android') => {
  Object.defineProperty(Platform, 'OS', {
    value: os,
    configurable: true,
    writable: true,
  });
};

describe('useSubscription', () => {
  let hookResult: any;

  function TestComponent() {
    hookResult = useSubscription();
    return null;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform('ios');
    (isPurchasesSupported as jest.Mock).mockReturnValue(true);
  });

  it('initially returns loading state', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves
    
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(hookResult.status).toBe('loading');
    expect(hookResult.isActive).toBe(false);
  });

  it('returns active if platform is not ios (e.g., android)', async () => {
    setPlatform('android');
    
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(hookResult.status).toBe('active');
    expect(hookResult.isActive).toBe(true);
    expect(Purchases.getCustomerInfo).not.toHaveBeenCalled();
  });

  it('returns active if purchases are not supported (e.g., Expo Go)', async () => {
    (isPurchasesSupported as jest.Mock).mockReturnValue(false);
    
    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(hookResult.status).toBe('active');
    expect(hookResult.isActive).toBe(true);
    expect(Purchases.getCustomerInfo).not.toHaveBeenCalled();
  });

  it('returns active if the user has the Stacked Pro entitlement', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: {
        active: {
          [ENTITLEMENT_ID]: {},
        },
      },
    });

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
    expect(hookResult.status).toBe('active');
    expect(hookResult.isActive).toBe(true);
  });

  it('returns inactive if the user does not have the Stacked Pro entitlement', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: {
        active: {},
      },
    });

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
    expect(hookResult.status).toBe('inactive');
    expect(hookResult.isActive).toBe(false);
  });

  it('fails open (returns active) if getCustomerInfo throws an error', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(Purchases.getCustomerInfo).toHaveBeenCalled();
    expect(hookResult.status).toBe('active');
    expect(hookResult.isActive).toBe(true);
  });

  it('updates entitlement status dynamically when listener triggers', async () => {
    (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: {
        active: {}, // start inactive
      },
    });

    let listenerCallback: ((info: any) => void) | null = null;
    (Purchases.addCustomerInfoUpdateListener as jest.Mock).mockImplementation((listener) => {
      listenerCallback = listener;
    });

    await act(async () => {
      TestRenderer.create(React.createElement(TestComponent));
    });

    expect(hookResult.status).toBe('inactive');

    // Simulate listener update to active
    await act(async () => {
      if (listenerCallback) {
        (listenerCallback as any)({
          entitlements: {
            active: {
              [ENTITLEMENT_ID]: {},
            },
          },
        });
      }
    });

    expect(hookResult.status).toBe('active');
    expect(hookResult.isActive).toBe(true);
  });
});
